import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { MAX_ACTIVE_JOBS_PER_USER } from "@/lib/limits";

export const runtime = "nodejs";

const RECENT_DONE_MS = 15_000;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const db = await getDb();

  const sites = await db
    .collection("sites")
    .find({ userId: session.uid }, { projection: { siteId: 1, origin: 1 } })
    .toArray();

  if (sites.length === 0) {
    return NextResponse.json({ jobs: [], limit: MAX_ACTIVE_JOBS_PER_USER });
  }

  const siteIds = sites.map((s: any) => s.siteId);
  const originBySite = new Map<string, string>(
    sites.map((s: any) => [s.siteId, s.origin]),
  );

  const recentThreshold = new Date(Date.now() - RECENT_DONE_MS);
  const docs = await db
    .collection("notifications")
    .find(
      {
        siteId: { $in: siteIds },
        $or: [
          { status: { $in: ["pending", "sending"] } },
          { status: "done", finishedAt: { $gte: recentThreshold } },
        ],
      },
      {
        projection: {
          siteId: 1,
          title: 1,
          status: 1,
          attempted: 1,
          delivered: 1,
          failed: 1,
          error: 1,
          sentAt: 1,
          finishedAt: 1,
        },
      },
    )
    .sort({ sentAt: -1 })
    .limit(20)
    .toArray();

  const jobs = docs.map((d: any) => ({
    id: d._id.toString(),
    siteId: d.siteId,
    origin: originBySite.get(d.siteId) || "",
    title: d.title || "",
    status: d.status || "done",
    attempted: d.attempted || 0,
    delivered: d.delivered || 0,
    failed: d.failed || 0,
    error: d.error || null,
    startedAt: d.sentAt ? new Date(d.sentAt).getTime() : Date.now(),
    finishedAt: d.finishedAt ? new Date(d.finishedAt).getTime() : undefined,
  }));

  return NextResponse.json({ jobs, limit: MAX_ACTIVE_JOBS_PER_USER });
}
