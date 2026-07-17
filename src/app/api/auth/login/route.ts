import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { hashCode, normalizeCode, createSession, setCodeRecoveryCookie } from "@/lib/auth";
import { checkLoginRate, ipFrom } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = ipFrom(req);
  const ok = await checkLoginRate(ip);
  if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const { code } = await req.json().catch(() => ({}));
  const digits = normalizeCode(code || "");
  if (digits.length !== 16) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const db = await getDb();
  const user = await db.collection("users").findOne({ codeHash: hashCode(digits) });
  if (!user) return NextResponse.json({ error: "Invalid code" }, { status: 401 });

  await createSession(user.userId);
  setCodeRecoveryCookie(digits);
  return NextResponse.json({ ok: true });
}
