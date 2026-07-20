import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { siteId: string; notifId: string } },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  if (!ObjectId.isValid(params.notifId)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const db = await getDb();
  const site = await db
    .collection("sites")
    .findOne({ siteId: params.siteId, userId: session.uid }, { projection: { _id: 1 } });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const doc = await db.collection("notifications").findOne(
    { _id: new ObjectId(params.notifId), siteId: params.siteId },
    { projection: { status: 1, attempted: 1, delivered: 1, failed: 1, error: 1, finishedAt: 1 } },
  );
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    status: doc.status || "done",
    attempted: doc.attempted || 0,
    delivered: doc.delivered || 0,
    failed: doc.failed || 0,
    error: doc.error || null,
    finishedAt: doc.finishedAt || null,
  });
}
