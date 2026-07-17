import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { normalizeOrigin } from "@/lib/ids";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  const { siteId, origin, subscription } = await req.json().catch(() => ({}));
  if (!siteId || !subscription?.endpoint) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId });
  if (!site) return NextResponse.json({ error: "unknown_site" }, { status: 404 });

  let normalized: string | null = null;
  try {
    normalized = normalizeOrigin(origin);
  } catch {}

  if (normalized !== site.origin) {
    return NextResponse.json({ error: "origin_mismatch" }, { status: 403 });
  }

  await db.collection("subscribers").updateOne(
    { siteId, endpoint: subscription.endpoint },
    {
      $set: {
        siteId,
        endpoint: subscription.endpoint,
        keys: subscription.keys || {},
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  if (!site.verified) {
    await db.collection("sites").updateOne({ siteId }, { $set: { verified: true, verifiedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
