import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const DAYS = 30;

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();

  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (DAYS - 1));

  const bucket = (field: string) => ({
    $dateToString: { format: "%Y-%m-%d", date: `$${field}`, timezone: "UTC" },
  });

  const [signupsRaw, notifsRaw, topSites] = await Promise.all([
    db
      .collection("users")
      .aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: bucket("createdAt"), n: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection("notifications")
      .aggregate([
        { $match: { sentAt: { $gte: start } } },
        {
          $group: {
            _id: bucket("sentAt"),
            attempted: { $sum: { $ifNull: ["$attempted", 0] } },
            delivered: { $sum: { $ifNull: ["$delivered", 0] } },
          },
        },
      ])
      .toArray(),
    db
      .collection("sites")
      .aggregate([
        {
          $lookup: {
            from: "subscribers",
            localField: "siteId",
            foreignField: "siteId",
            as: "subs",
          },
        },
        {
          $project: {
            _id: 0,
            origin: 1,
            subscribers: { $size: "$subs" },
          },
        },
        { $sort: { subscribers: -1 } },
        { $limit: 8 },
      ])
      .toArray(),
  ]);

  const signupMap = new Map(signupsRaw.map((r: any) => [r._id, r.n]));
  const notifMap = new Map(notifsRaw.map((r: any) => [r._id, r]));

  const days: {
    date: string;
    signups: number;
    attempted: number;
    delivered: number;
  }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const n = notifMap.get(key) as any;
    days.push({
      date: key,
      signups: signupMap.get(key) || 0,
      attempted: n?.attempted || 0,
      delivered: n?.delivered || 0,
    });
  }

  return NextResponse.json({ days, topSites });
}
