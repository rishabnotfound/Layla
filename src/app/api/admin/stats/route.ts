import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauth" }, { status: 401 });
  }
  const db = await getDb();

  const now = Date.now();
  const day = new Date(now - 24 * 60 * 60 * 1000);
  const week = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [users, sites, subscribers, notifications, usersDay, usersWeek, notifDay, notifWeek] =
    await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("sites").countDocuments(),
      db.collection("subscribers").countDocuments(),
      db.collection("notifications").countDocuments(),
      db.collection("users").countDocuments({ createdAt: { $gte: day } }),
      db.collection("users").countDocuments({ createdAt: { $gte: week } }),
      db.collection("notifications").countDocuments({ sentAt: { $gte: day } }),
      db.collection("notifications").countDocuments({ sentAt: { $gte: week } }),
    ]);

  const deliveredAgg = await db
    .collection("sites")
    .aggregate([
      {
        $group: {
          _id: null,
          sent: { $sum: { $ifNull: ["$sentCount", 0] } },
          attempted: { $sum: { $ifNull: ["$attemptedTotal", 0] } },
          delivered: { $sum: { $ifNull: ["$deliveredTotal", 0] } },
        },
      },
    ])
    .toArray();
  const totals = deliveredAgg[0] || { sent: 0, attempted: 0, delivered: 0 };

  return NextResponse.json({
    totals: {
      users,
      sites,
      subscribers,
      notifications,
      sentLifetime: totals.sent,
      attemptedLifetime: totals.attempted,
      deliveredLifetime: totals.delivered,
    },
    recent: {
      usersDay,
      usersWeek,
      notifDay,
      notifWeek,
    },
  });
}
