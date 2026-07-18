import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 50));

  const db = await getDb();
  const filter: any = {};
  if (q) filter.origin = { $regex: escapeRegex(q), $options: "i" };

  const sites = await db
    .collection("sites")
    .aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
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
          siteId: 1,
          userId: 1,
          origin: 1,
          verified: 1,
          createdAt: 1,
          sentCount: { $ifNull: ["$sentCount", 0] },
          attemptedTotal: { $ifNull: ["$attemptedTotal", 0] },
          deliveredTotal: { $ifNull: ["$deliveredTotal", 0] },
          subscribers: { $size: "$subs" },
        },
      },
    ])
    .toArray();

  return NextResponse.json({ sites });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
