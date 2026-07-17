import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  if (!siteId) return NextResponse.json({ error: "bad" }, { status: 400 });

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId, userId: session.uid });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const subs = await db.collection("subscribers").countDocuments({ siteId });
  return NextResponse.json({ subs, verified: !!site.verified });
}
