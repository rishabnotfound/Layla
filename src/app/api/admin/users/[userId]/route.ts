import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";
import { logAdmin } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();
  const user = await db.collection("users").findOne({ userId: params.userId });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sites = await db.collection("sites").find({ userId: params.userId }).toArray();
  const siteIds = sites.map((s: any) => s.siteId);

  await Promise.all([
    db.collection("users").deleteOne({ userId: params.userId }),
    db.collection("sites").deleteMany({ userId: params.userId }),
    siteIds.length ? db.collection("subscribers").deleteMany({ siteId: { $in: siteIds } }) : Promise.resolve(),
    siteIds.length ? db.collection("notifications").deleteMany({ siteId: { $in: siteIds } }) : Promise.resolve(),
  ]);

  await logAdmin("delete_user", {
    type: "user",
    id: params.userId,
    meta: { siteCount: siteIds.length, origins: sites.map((s: any) => s.origin) },
  });

  return NextResponse.json({ ok: true, siteCount: siteIds.length });
}
