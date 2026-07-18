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
  if (q) filter.userId = { $regex: escapeRegex(q), $options: "i" };

  const users = await db
    .collection("users")
    .aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "sites",
          localField: "userId",
          foreignField: "userId",
          as: "sites",
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          createdAt: 1,
          siteCount: { $size: "$sites" },
          origins: "$sites.origin",
        },
      },
    ])
    .toArray();

  return NextResponse.json({ users });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
