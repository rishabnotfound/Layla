import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import AddSiteButton from "./AddSiteButton";
import { HoverGridCards, HoverCard } from "@/components/ui/HoverGridCards";
import CopySnippetButton from "./CopySnippetButton";
import SiteFavicon from "@/components/ui/SiteFavicon";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = (await getSession())!;
  const db = await getDb();
  const sites = await db
    .collection("sites")
    .find({ userId: session.uid })
    .sort({ createdAt: -1 })
    .toArray();

  const withCounts = await Promise.all(
    sites.map(async (s: any) => {
      const [subs, last] = await Promise.all([
        db.collection("subscribers").countDocuments({ siteId: s.siteId }),
        db
          .collection("notifications")
          .find({ siteId: s.siteId })
          .sort({ sentAt: -1 })
          .limit(1)
          .toArray(),
      ]);
      return {
        ...s,
        subs,
        sent: s.sentCount ?? 0,
        lastTitle: last[0]?.title ?? null,
        lastAt: last[0]?.sentAt ?? null,
      };
    })
  );

  const totalSubs = withCounts.reduce((a, s) => a + s.subs, 0);
  const totalSent = withCounts.reduce((a, s) => a + s.sent, 0);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://layla.wtf";

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Dashboard</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your sites</h1>
          <p className="mt-1 text-sm text-muted">Add a site, drop the snippet, start sending.</p>
        </div>
        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center justify-around gap-2 rounded-lg border border-border bg-panel/60 px-3 py-2 backdrop-blur sm:flex-initial sm:justify-start sm:gap-5 sm:px-4">
            <Stat label="Sites" value={withCounts.length} />
            <Divider />
            <Stat label="Subs" value={totalSubs} />
            <Divider />
            <Stat label="Sent" value={totalSent} />
          </div>
          <AddSiteButton />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Sites</h2>
          <span className="text-xs text-muted">{withCounts.length} total</span>
        </div>

        {withCounts.length === 0 ? (
          <EmptyState />
        ) : (
          <HoverGridCards>
            {withCounts.map((s: any) => (
              <HoverCard key={s.siteId} className="min-h-[240px]">
                <div className="flex h-full flex-col p-5">
                  <Link
                    href={`/dashboard/sites/${s.siteId}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <SiteFavicon
                        host={hostOf(s.origin)}
                        fallback={(s.name || s.origin || "?").trim().charAt(0).toUpperCase()}
                        size={36}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-base font-semibold">
                            {s.name || s.origin}
                          </span>
                          <StatusPill ok={s.verified} />
                        </div>
                        <div className="mt-1 truncate text-xs text-muted">{s.origin}</div>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-black/40 text-muted transition group-hover/card:border-accent/60 group-hover/card:text-white">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>

                  <div className="my-4 rounded-lg border border-border/60 bg-black/40 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted">
                      <span
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          (s.lastAt ? "bg-accent shadow-[0_0_8px_rgba(93,10,209,0.7)]" : "bg-border")
                        }
                      />
                      Last notification
                    </div>
                    {s.lastTitle ? (
                      <div className="mt-1.5 flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm text-white">{s.lastTitle}</span>
                        <span className="shrink-0 text-[11px] text-muted">
                          {timeAgo(new Date(s.lastAt))}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1.5 text-sm text-muted">Nothing sent yet</div>
                    )}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <MiniStat label="Subscribers" value={s.subs} />
                    <MiniStat label="Notifications" value={s.sent} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[11px] text-muted">
                      Added {timeAgo(new Date(s.createdAt || Date.now()))}
                    </span>
                    <CopySnippetButton siteId={s.siteId} appUrl={appUrl} />
                  </div>
                </div>
              </HoverCard>
            ))}
          </HoverGridCards>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 pt-6 text-xs text-muted">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="" width={16} height={16} />
          <span>Layla — layla.wtf</span>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/tos" className="hover:text-white">Terms</Link>
        </div>
        <div>
          Built with love by{" "}
          <a
            href="https://github.com/rishabnotfound"
            target="_blank"
            rel="noreferrer"
            className="text-white hover:text-accent"
          >
            Rishab
          </a>
        </div>
      </div>
    </footer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm font-semibold text-white">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-border/70" aria-hidden />;
}

function StatusPill({ ok }: { ok?: boolean }) {
  return (
    <span
      className={
        "inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium " +
        (ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400")
      }
    >
      {ok ? "Ready" : "Pending"}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-black/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{value}</div>
    </div>
  );
} 

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-panel/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 006 0" />
        </svg>
      </div>
      <div className="mt-3 text-sm font-medium text-white">No sites yet</div>
      <p className="mt-1 max-w-xs text-xs text-muted">
        Click <b className="text-white">Add site</b> above to create your first one.
      </p>
    </div>
  );
}

function hostOf(origin: string) {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

function timeAgo(d: Date) {
  const secs = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
