import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { newId, normalizeOrigin } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { name, url } = await req.json().catch(() => ({}));
  let origin: string;
  try {
    origin = normalizeOrigin(url);
  } catch (e: any) {
    if (e?.message === "https_required") {
      return NextResponse.json(
        { error: "Origin must use HTTPS. Web push doesn't work over HTTP." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const db = await getDb();
  const siteId = newId("s");
  await db.collection("sites").insertOne({
    siteId,
    userId: session.uid,
    name: name?.trim() || null,
    origin,
    verified: false,
    createdAt: new Date(),
  });
  return NextResponse.json({ siteId });
}
