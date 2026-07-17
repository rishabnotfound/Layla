import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { siteId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId, userId: session.uid });
  if (!site) return NextResponse.json({ error: "not found" }, { status: 404 });

  await Promise.all([
    db.collection("sites").deleteOne({ siteId: params.siteId }),
    db.collection("subscribers").deleteMany({ siteId: params.siteId }),
    db.collection("notifications").deleteMany({ siteId: params.siteId }),
  ]);
  return NextResponse.json({ ok: true });
}
