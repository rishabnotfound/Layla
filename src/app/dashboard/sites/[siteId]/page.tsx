import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import Snippet from "./Snippet";
import Composer from "./Composer";
import DeleteSite from "./DeleteSite";

export const dynamic = "force-dynamic";

export default async function SitePage({ params }: { params: { siteId: string } }) {
  const session = (await getSession())!;
  const db = await getDb();
  const site = await db.collection("sites").findOne({ siteId: params.siteId, userId: session.uid });
  if (!site) notFound();

  const [subs, notifs] = await Promise.all([
    db.collection("subscribers").countDocuments({ siteId: site.siteId }),
    db
      .collection("notifications")
      .find({ siteId: site.siteId })
      .sort({ sentAt: -1 })
      .limit(20)
      .toArray(),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://layla.wtf";
  const totalAttempted = notifs.reduce((a: number, n: any) => a + (n.attempted || 0), 0);
  const totalDelivered = notifs.reduce((a: number, n: any) => a + (n.delivered || 0), 0);
  const deliveryRate =
    totalAttempted > 0 ? Math.round((totalDelivered / totalAttempted) * 100) : 100;

  return (
    <div className="space-y-8">
      <SiteHeader site={site} subs={subs} sent={notifs.length} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Subscribers" value={subs} icon={<UsersIcon />} accent />
        <StatTile label="Sent" value={notifs.length} icon={<PaperIcon />} />
        <StatTile label="Delivered" value={totalDelivered} icon={<CheckIcon />} />
        <StatTile label="Delivery rate" value={`${deliveryRate}%`} icon={<PulseIcon />} />
      </section>

      <Composer siteId={site.siteId} origin={site.origin} disabled={subs === 0} />

      <Snippet siteId={site.siteId} appUrl={appUrl} />

      <History notifs={notifs} />

      <DeleteSite siteId={site.siteId} />
    </div>
  );
}

function SiteHeader({ site, subs, sent }: { site: any; subs: number; sent: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-panel via-panel to-black p-5 sm:p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
      />
      <div className="relative flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 self-start text-xs text-muted transition hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sites
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill ok={site.verified} />
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {site.name || site.origin}
              </h1>
            </div>
            <a
              href={site.origin}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 truncate text-sm text-muted transition hover:text-white"
            >
              {site.origin}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
                <path d="M6 4h10v10M16 4L6 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="flex gap-2 text-xs">
            <MiniBadge label="Subscribers" value={subs} />
            <MiniBadge label="Sent" value={sent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ ok }: { ok?: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider " +
        (ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-yellow-500/40 bg-yellow-500/10 text-yellow-300")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" : "bg-yellow-400")
        }
      />
      {ok ? "Live" : "Pending"}
    </span>
  );
}

function MiniBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-black/40 px-3 py-1.5 text-right">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-xl border p-4 " +
        (accent ? "border-accent/40 bg-accent/10" : "border-border bg-panel")
      }
    >
      {accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/25 blur-2xl"
        />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
          <div className="mt-1.5 text-2xl font-semibold">{value}</div>
        </div>
        <div
          className={
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border " +
            (accent
              ? "border-accent/50 bg-accent/20 text-accent"
              : "border-border bg-black/40 text-muted")
          }
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function History({ notifs }: { notifs: any[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent">Activity</div>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight">History</h2>
        </div>
        <span className="text-xs text-muted">last 20</span>
      </div>

      {notifs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-panel/40 px-6 py-10 text-center text-sm text-muted">
          Nothing sent yet. Craft your first message above.
        </div>
      ) : (
        <ol className="relative space-y-3 border-l border-border/60 pl-5">
          {notifs.map((n: any) => {
            const rate =
              n.attempted > 0 ? Math.round((n.delivered / n.attempted) * 100) : 0;
            return (
              <li
                key={String(n._id)}
                className="group relative rounded-xl border border-border bg-panel p-4 transition hover:border-accent/50"
              >
                <span
                  aria-hidden
                  className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-black bg-accent shadow-[0_0_10px_rgba(93,10,209,0.7)]"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">{n.title}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-muted">{n.body}</div>
                    {n.url && (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-border bg-black/40 px-2 py-1 text-[11px] text-muted transition hover:border-accent/50 hover:text-white"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
                          <path d="M9 11a4 4 0 005.7 0l2.6-2.6a4 4 0 10-5.7-5.7L10 4" strokeLinecap="round" />
                          <path d="M11 9a4 4 0 00-5.7 0L2.7 11.6a4 4 0 105.7 5.7L10 16" strokeLinecap="round" />
                        </svg>
                        <span className="truncate">{n.url}</span>
                      </a>
                    )}
                  </div>
                  <div className="min-w-[140px] text-left sm:text-right">
                    <div className="text-[11px] text-muted">
                      {new Date(n.sentAt).toLocaleString()}
                    </div>
                    <div className="mt-1.5 text-xs">
                      <b className="text-white">{n.delivered}</b>
                      <span className="text-muted">/{n.attempted} · {rate}%</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5 sm:w-[140px]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-fuchsia-400"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
      <circle cx="7" cy="7" r="3" />
      <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" strokeLinecap="round" />
      <circle cx="14" cy="6" r="2.2" />
      <path d="M18 15c0-2-1.5-3.5-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function PaperIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
      <path d="M3 4h14l-7 6L3 4z" strokeLinejoin="round" />
      <path d="M3 4v11l7-5 7 5V4" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
      <path d="M2 10h4l2-5 3 10 2-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
