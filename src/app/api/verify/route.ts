import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { normalizeOrigin } from "@/lib/ids";
export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { siteId, origin } = body ?? {};
  if (typeof siteId !== "string" || !siteId) return json({ error: "bad" }, 400);
  if (typeof origin !== "string" || !origin) return json({ error: "bad" }, 400);

  const reqOrigin = req.headers.get("origin");
  let normalized: string | null = null;
  try {
    normalized = normalizeOrigin(origin);
  } catch {}
  if (!normalized || reqOrigin !== normalized) {
    return json({ error: "origin_mismatch" }, 403);
  }

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId });
  if (!site) return json({ ok: false }, 404);

  if (normalized === site.origin && !site.verified) {
    await db.collection("sites").updateOne({ siteId }, { $set: { verified: true, verifiedAt: new Date() } });
  }
  return json({ ok: true });
}

function json(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
