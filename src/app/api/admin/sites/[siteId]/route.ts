import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";
import { logAdmin } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { siteId: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [subscribers, notifications] = await Promise.all([
    db.collection("subscribers").countDocuments({ siteId: site.siteId }),
    db
      .collection("notifications")
      .find({ siteId: site.siteId })
      .sort({ sentAt: -1 })
      .limit(10)
      .toArray(),
  ]);

  return NextResponse.json({
    site: {
      siteId: site.siteId,
      userId: site.userId,
      origin: site.origin,
      verified: !!site.verified,
      createdAt: site.createdAt,
      sentCount: site.sentCount || 0,
      attemptedTotal: site.attemptedTotal || 0,
      deliveredTotal: site.deliveredTotal || 0,
      subscribers,
    },
    notifications: notifications.map((n: any) => ({
      title: n.title,
      body: n.body,
      url: n.url,
      icon: n.icon,
      image: n.image,
      attempted: n.attempted,
      delivered: n.delivered,
      sentAt: n.sentAt,
    })),
  });
}

export async function DELETE(_req: Request, { params }: { params: { siteId: string } }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await Promise.all([
    db.collection("sites").deleteOne({ siteId: params.siteId }),
    db.collection("subscribers").deleteMany({ siteId: params.siteId }),
    db.collection("notifications").deleteMany({ siteId: params.siteId }),
  ]);

  await logAdmin("delete_site", {
    type: "site",
    id: params.siteId,
    meta: { origin: site.origin, userId: site.userId },
  });

  return NextResponse.json({ ok: true });
}
