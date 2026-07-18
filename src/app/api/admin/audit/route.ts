import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();
  const entries = await db
    .collection("admin_audit")
    .find({})
    .sort({ at: -1 })
    .limit(200)
    .toArray();
  return NextResponse.json({
    entries: entries.map((e: any) => ({
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      meta: e.meta,
      at: e.at,
    })),
  });
}
