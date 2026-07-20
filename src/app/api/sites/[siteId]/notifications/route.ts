import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 10;

import { MAX_ACTIVE_JOBS_PER_USER } from "@/lib/limits";

const QUEUE_URL = process.env.QUEUE_URL || "http://127.0.0.1:4001";

async function kickQueue() {
  try {
    await fetch(`${QUEUE_URL}/kick`, { method: "POST" });
  } catch {
    // worker will pick it up on next poll
  }
}

const httpsUrl = z
  .string()
  .max(2048)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "https:" && !!u.hostname;
      } catch {
        return false;
      }
    },
    { message: "must be an https URL" }
  );

const actionSchema = z.object({
  label: z.string().min(1).max(24),
  url: httpsUrl,
});

const schema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  url: httpsUrl.optional().or(z.literal("")),
  icon: httpsUrl.optional().or(z.literal("")),
  image: httpsUrl.optional().or(z.literal("")),
  actions: z.array(actionSchema).max(2).optional(),
});

export async function POST(req: Request, { params }: { params: { siteId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId, userId: session.uid });
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const userSiteIds = await db
    .collection("sites")
    .find({ userId: session.uid }, { projection: { siteId: 1 } })
    .toArray();
  const activeCount = await db.collection("notifications").countDocuments({
    siteId: { $in: userSiteIds.map((s: any) => s.siteId) },
    status: { $in: ["pending", "sending"] },
  });
  if (activeCount >= MAX_ACTIVE_JOBS_PER_USER) {
    return NextResponse.json(
      { error: "too_many_active", limit: MAX_ACTIVE_JOBS_PER_USER, active: activeCount },
      { status: 429 },
    );
  }

  const subCount = await db.collection("subscribers").countDocuments({ siteId: site.siteId });
  if (subCount === 0) {
    return NextResponse.json({ error: "no_subscribers" }, { status: 400 });
  }

  const actions = (parsed.data.actions || []).filter((a) => a.label && a.url);

  const { insertedId } = await db.collection("notifications").insertOne({
    siteId: site.siteId,
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url || site.origin,
    icon: parsed.data.icon || null,
    image: parsed.data.image || null,
    actions: actions.length ? actions : null,
    attempted: subCount,
    delivered: 0,
    failed: 0,
    status: "pending",
    sentAt: new Date(),
  });

  kickQueue();

  return NextResponse.json(
    { ok: true, notificationId: insertedId.toString(), attempted: subCount },
    { status: 202 },
  );
}
