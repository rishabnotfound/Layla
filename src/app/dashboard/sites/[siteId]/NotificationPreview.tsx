"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type OS = "macos" | "windows" | "android" | "chrome" | "brave";

const OS_META: { id: OS; label: string; sub: string }[] = [
  { id: "macos", label: "macOS", sub: "Notification Center" },
  { id: "windows", label: "Windows", sub: "Action Center" },
  { id: "android", label: "Android", sub: "Chrome" },
  { id: "chrome", label: "Chrome", sub: "Desktop" },
  { id: "brave", label: "Brave", sub: "Desktop" },
];

export default function NotificationPreview({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  const [os, setOs] = useState<OS>("macos");

  return (
    <div className="flex flex-col rounded-xl border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent">Preview</div>
          <h3 className="mt-0.5 text-sm font-semibold text-white">How it&apos;ll look</h3>
        </div>
        <span className="hidden text-[11px] text-muted sm:inline">
          {OS_META.find((o) => o.id === os)?.sub}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border/60 px-3 py-2">
        {OS_META.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setOs(o.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
              os === o.id
                ? "bg-accent text-white shadow-[0_0_20px_-6px_rgba(93,10,209,0.8)]"
                : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-hidden p-6",
          bgFor(os)
        )}
      >
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(93,10,209,0.15),transparent_50%)]" />
        <div className="relative w-full max-w-sm">
          {os === "macos" && <MacToast title={title} body={body} iconUrl={iconUrl} originHost={originHost} />}
          {os === "windows" && <WinToast title={title} body={body} iconUrl={iconUrl} originHost={originHost} />}
          {os === "android" && <AndroidToast title={title} body={body} iconUrl={iconUrl} originHost={originHost} />}
          {os === "chrome" && <ChromeToast title={title} body={body} iconUrl={iconUrl} originHost={originHost} />}
          {os === "brave" && <BraveToast title={title} body={body} iconUrl={iconUrl} originHost={originHost} />}
        </div>
      </div>
    </div>
  );
}

function bgFor(os: OS) {
  switch (os) {
    case "macos":
      return "bg-gradient-to-br from-[#2b1a5c] via-[#1a1240] to-[#0b0620]";
    case "windows":
      return "bg-gradient-to-br from-[#0a2540] via-[#071a2d] to-[#040d17]";
    case "android":
      return "bg-gradient-to-br from-[#0d1a12] via-[#0a1310] to-[#050b08]";
    case "chrome":
      return "bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black";
    case "brave":
      return "bg-gradient-to-br from-[#2a1408] via-[#180b04] to-[#0a0402]";
  }
}

function Icon({ src }: { src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-accent/30">
      <Image src="/logo.png" alt="" width={22} height={22} />
    </div>
  );
}

/* ---------- macOS toast ---------- */
function MacToast({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(40,40,45,0.72)] p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          <Icon src={iconUrl} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">
              {originHost}
            </span>
            <span className="text-[10px] text-white/40">now</span>
          </div>
          <div className="mt-0.5 truncate text-[13px] font-semibold text-white">{title || " "}</div>
          <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/80">
            {body || " "}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Windows 11 toast ---------- */
function WinToast({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(30,30,30,0.9)] p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-[10px] text-white/50">
        <span>Google Chrome</span>
        <div className="flex items-center gap-2">
          <span>now</span>
          <span className="rounded p-0.5 hover:bg-white/10">×</span>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
          <Icon src={iconUrl} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{title || " "}</div>
          <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/80">
            {body || " "}
          </div>
          <div className="mt-1 text-[10px] text-white/40">via {originHost}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Android (heads-up) ---------- */
function AndroidToast({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  return (
    <div className="rounded-3xl bg-[rgba(28,32,30,0.95)] p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)]">
      <div className="mb-2 flex items-center gap-2 text-[10px] text-white/60">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/60 text-[9px] text-white">
          L
        </div>
        <span>Chrome</span>
        <span className="text-white/30">•</span>
        <span>{originHost}</span>
        <span className="text-white/30">•</span>
        <span>now</span>
      </div>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{title || " "}</div>
          <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/80">
            {body || " "}
          </div>
        </div>
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
          <Icon src={iconUrl} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Chrome desktop popup ---------- */
function ChromeToast({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#202124] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5 text-[10px] text-white/50">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" className="h-3 w-3 text-white/60">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="10" cy="10" r="3" fill="currentColor" />
          </svg>
          <span>Google Chrome · {originHost}</span>
        </div>
        <span>×</span>
      </div>
      <div className="flex gap-3 p-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
          <Icon src={iconUrl} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{title || " "}</div>
          <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/75">
            {body || " "}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Brave desktop popup ---------- */
function BraveToast({
  title,
  body,
  iconUrl,
  originHost,
}: {
  title: string;
  body: string;
  iconUrl?: string;
  originHost: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#fb542b]/40 bg-[#1a1613] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#241a15] px-3 py-1.5 text-[10px] text-white/60">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#fb542b]" />
          <span>Brave · {originHost}</span>
        </div>
        <span>×</span>
      </div>
      <div className="flex gap-3 p-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
          <Icon src={iconUrl} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{title || " "}</div>
          <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-white/75">
            {body || " "}
          </div>
          <div className="mt-1 text-[10px] text-[#fb542b]/70">
            Some Brave configs block push — heads up.
          </div>
        </div>
      </div>
    </div>
  );
}
