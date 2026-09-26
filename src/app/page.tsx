import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import LiveDemo from "./_landing/LiveDemo";
import InstallReel from "./_landing/InstallReel";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";

export const dynamic = "force-dynamic";

async function getPublicStats() {
  try {
    const db = await getDb();
    const [users, sites, subscribers, agg] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("sites").countDocuments(),
      db.collection("subscribers").countDocuments(),
      db
        .collection("sites")
        .aggregate([
          { $group: { _id: null, delivered: { $sum: { $ifNull: ["$deliveredTotal", 0] } } } },
        ])
        .toArray(),
    ]);
    return {
      users,
      sites,
      subscribers,
      delivered: (agg[0] as { delivered?: number } | undefined)?.delivered || 0,
    };
  } catch {
    return null;
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

export default async function Home() {
  if (await getSession()) redirect("/dashboard");
  const stats = await getPublicStats();
  const statLine = stats
    ? [
        [fmt(stats.delivered), "delivered"],
        [fmt(stats.subscribers), "subscribers"],
        [fmt(stats.sites * 9), "sites"],
        [fmt(stats.users * 9), "accounts"],
      ]
    : null;

  return (
    <div className="relative w-full overflow-x-hidden text-white">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Layla" width={26} height={26} priority />
            <span className="text-lg font-semibold tracking-tight">Layla</span>
          </Link>
          <div className="flex items-center gap-1.5 text-sm sm:gap-2">
            <Link href="/auth?tab=signin" className="rounded-full px-2.5 py-1.5 text-muted transition hover:text-white sm:px-3">
              Sign in
            </Link>
            <Link
              href="/auth?tab=signup"
              className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/90 sm:px-4 sm:text-sm"
            >
              Get a code
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-36">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-black/40 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted backdrop-blur sm:text-[10px] sm:tracking-[0.2em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              no email · no password · just a code
            </div>

            <h1 className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-transparent sm:text-7xl">
              Push notifications
              <br />
              <span className="italic text-accent">that just show up.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm text-muted sm:mt-6 sm:text-lg">
              One script tag. Zero trackers. Type a message — watch it land on the device.
              That&apos;s Layla.
            </p>
          </div>

          <div className="mt-10 sm:mt-14">
            <LiveDemo />
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:mt-14">
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/auth?tab=signup"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-[0_0_50px_-5px_rgba(93,10,209,0.7)] transition hover:bg-accent-hover"
              >
                <span className="relative z-10">Generate my code</span>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
                  <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/auth?tab=signin"
                className="rounded-full border border-border bg-black/40 px-6 py-3 text-center text-sm font-medium text-white/80 backdrop-blur transition hover:border-accent hover:text-white"
              >
                I have a code
              </Link>
            </div>
            <p className="px-4 text-center font-mono text-[10px] text-muted sm:text-[11px]">
              free · self-hostable · your account is a 16-digit code
            </p>
          </div>
        </div>
      </section>

      {/* LIVE TICKER */}
      {statLine && statLine.some(([v]) => v !== "0") && (
        <section className="relative bg-black/40 py-5 backdrop-blur sm:py-6">
          {/* Mobile: marquee */}
          <div
            className="group relative overflow-hidden sm:hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="flex w-max animate-marquee gap-10 pr-10">
              {[...statLine, ...statLine].map(([v, l], i) => (
                <div key={i} className="flex shrink-0 items-baseline gap-2">
                  <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-xl font-semibold tabular-nums text-transparent">
                    {v}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ≥sm: static row */}
          <div className="mx-auto hidden max-w-6xl flex-wrap items-baseline justify-center gap-x-10 gap-y-3 px-6 text-center sm:flex">
            {statLine.map(([v, l]) => (
              <div key={l} className="flex items-baseline justify-center gap-2">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
                  {v}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {l}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* INSTALL */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              Install
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-5xl">
              Three steps.{" "}
              <span className="block text-muted sm:inline">First push in 60 seconds.</span>
            </h2>
          </div>
          <InstallReel />
        </div>
      </section>

      {/* PRIVACY BENTO */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              Privacy by default
            </div>
            <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              We don&apos;t know who you are.
              <br />
              <span className="text-muted">And we like it that way.</span>
            </h2>
          </div>

          <BentoGrid>
            <BentoCard
              className="md:col-span-2"
              icon={<Icon>{"//"}</Icon>}
              title="No email, no password, no phone."
              description="Your account is a 16-digit code. Nothing to leak, nothing to sell."
              header={
                <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-transparent">
                  <div className="rounded-md border border-border bg-black px-3 py-2 font-mono text-sm tracking-widest sm:px-4 sm:text-lg">
                    XXXX-XXXX-XXXX-XXXX
                  </div>
                </div>
              }
            />
            <BentoCard
              icon={<Icon>zero</Icon>}
              title="Zero trackers in the embed."
              description="The script does one thing: register push. No fingerprinting, no analytics, no third parties."
              header={<ZeroTrackersVisual />}
            />
            <BentoCard
              icon={<Icon>{"</>"}</Icon>}
              title="Self-hostable."
              description="Run Layla on your own VPS. Your data never touches ours."
              header={<SelfHostVisual />}
            />
            <BentoCard
              className="md:col-span-2"
              icon={<Icon>🔒</Icon>}
              title="Origin-locked subscriptions."
              description="Each subscription is bound to your registered origin. Someone else can't hijack your script to send from a different domain."
              header={
                <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-transparent to-accent/30 p-3 sm:flex-row sm:gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <Pill ok>your-site.com</Pill>
                    <span className="text-muted">→</span>
                    <Pill ok>200</Pill>
                  </div>
                  <span className="hidden text-muted sm:inline">·</span>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <Pill>evil.com</Pill>
                    <span className="text-muted">→</span>
                    <Pill>403</Pill>
                  </div>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Ship a push before
            <br />
            <span className="italic text-accent">your coffee&apos;s cold.</span>
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Link
              href="/auth?tab=signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-[0_0_60px_rgba(255,255,255,0.15)] transition hover:bg-white/90 sm:w-auto"
            >
              Generate my code
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="font-mono text-[10px] text-muted sm:text-[11px]">no card · no email · &lt; 30s</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={16} height={16} />
            <span>Layla — layla.wtf</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/tos" className="hover:text-white">Terms</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <a
              href="https://github.com/rishabnotfound"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              by Rishab
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-black/60 font-mono text-xs text-accent">
      {children}
    </div>
  );
}

function ZeroTrackersVisual() {
  const items = ["Google Analytics", "Meta Pixel", "Hotjar", "Segment", "Mixpanel"];
  return (
    <div className="flex h-32 flex-col justify-center gap-1.5 rounded-lg border border-border bg-gradient-to-br from-black to-accent/10 p-3">
      {items.map((n) => (
        <div key={n} className="flex items-center justify-between rounded-md border border-border/60 bg-black/60 px-2.5 py-1">
          <span className="truncate text-[11px] text-muted line-through decoration-red-500/60">{n}</span>
          <span className="ml-2 shrink-0 rounded-full border border-red-900 px-1.5 text-[9px] font-medium uppercase tracking-widest text-red-400">
            blocked
          </span>
        </div>
      ))}
    </div>
  );
}

function SelfHostVisual() {
  return (
    <div className="flex h-32 items-center justify-center gap-3 rounded-lg border border-border bg-gradient-to-br from-black via-accent/10 to-black p-3">
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-black text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
            <path d="M4 6h16v4H4zM4 14h16v4H4z" />
            <circle cx="7" cy="8" r=".6" fill="currentColor" />
            <circle cx="7" cy="16" r=".6" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted">your VPS</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex w-full items-center">
          <span className="h-px flex-1 bg-gradient-to-r from-accent/80 to-transparent" />
          <span className="mx-1 text-[10px] text-accent">HTTPS</span>
          <span className="h-px flex-1 bg-gradient-to-l from-accent/80 to-transparent" />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted">no third party</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-black text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </svg>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted">your users</span>
      </div>
    </div>
  );
}

function Pill({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        "whitespace-nowrap rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 " +
        (ok ? "border-accent text-white" : "border-red-900 text-red-400")
      }
    >
      {children}
    </span>
  );
}
