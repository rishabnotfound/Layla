import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { generateCode, hashCode, createSession, setCodeRecoveryCookie } from "@/lib/auth";
import { newId } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST() {
  const db = await getDb();
  const users = db.collection("users");

  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const codeHash = hashCode(code);
    const exists = await users.findOne({ codeHash });
    if (exists) continue;
    const userId = newId("u");
    await users.insertOne({ userId, codeHash, createdAt: new Date() });
    await createSession(userId);
    setCodeRecoveryCookie(code);
    return NextResponse.json({ code });
  }
  return NextResponse.json({ error: "try_again" }, { status: 500 });
}
