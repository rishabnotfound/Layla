import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { webpush } from "@/lib/push";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  url: z.string().url().optional().or(z.literal("")),
  icon: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request, { params }: { params: { siteId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId, userId: session.uid });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const subs = await db.collection("subscribers").find({ siteId: site.siteId }).toArray();

  const payload = JSON.stringify({
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url || site.origin,
    icon: parsed.data.icon || undefined,
  });

  let delivered = 0;
  let failed = 0;
  const gone: string[] = [];

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys not configured on server" }, { status: 500 });
  }

  await Promise.all(
    subs.map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          payload,
          { TTL: 60 * 60 * 24 }
        );
        delivered++;
      } catch (e: any) {
        failed++;
        const code = e?.statusCode;
        if (code === 404 || code === 410) gone.push(s.endpoint);
      }
    })
  );

  if (gone.length) {
    await db.collection("subscribers").deleteMany({ siteId: site.siteId, endpoint: { $in: gone } });
  }

  await db.collection("notifications").insertOne({
    siteId: site.siteId,
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url || null,
    icon: parsed.data.icon || null,
    attempted: subs.length,
    delivered,
    sentAt: new Date(),
  });

  await db.collection("sites").updateOne(
    { siteId: site.siteId },
    {
      $inc: {
        sentCount: 1,
        attemptedTotal: subs.length,
        deliveredTotal: delivered,
      },
    }
  );

  const HISTORY_LIMIT = 10;
  const keep = await db
    .collection("notifications")
    .find({ siteId: site.siteId }, { projection: { _id: 1 } })
    .sort({ sentAt: -1 })
    .limit(HISTORY_LIMIT)
    .toArray();
  if (keep.length === HISTORY_LIMIT) {
    await db.collection("notifications").deleteMany({
      siteId: site.siteId,
      _id: { $nin: keep.map((n: any) => n._id) },
    });
  }

  return NextResponse.json({ ok: true, attempted: subs.length, delivered, failed });
}
