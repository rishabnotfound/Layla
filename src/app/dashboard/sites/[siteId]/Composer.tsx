"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationPreview from "./NotificationPreview";

export default function Composer({
  siteId,
  origin,
  disabled,
}: {
  siteId: string;
  origin: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const originHost = useMemo(() => {
    try {
      return new URL(origin).host;
    } catch {
      return origin;
    }
  }, [origin]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/sites/${siteId}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url, icon }),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: j.error || "Failed" });
    setMsg({ ok: true, text: `Sent to ${j.delivered}/${j.attempted} subscribers` });
    setTitle("");
    setBody("");
    setUrl("");
    setIcon("");
    router.refresh();
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        onSubmit={send}
        className="relative overflow-hidden rounded-xl border border-border bg-panel"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        />
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-accent">Compose</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">New notification</h2>
          </div>
          {disabled && (
            <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-yellow-300">
              No subs
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <Field label="Title" hint={`${title.length}/120`}>
            <input
              className="w-full rounded-lg border border-border bg-black/60 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              placeholder="Weekly digest — 5 new posts"
            />
          </Field>

          <Field label="Body" hint={`${body.length}/400`}>
            <textarea
              className="w-full resize-none rounded-lg border border-border bg-black/60 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              maxLength={400}
              placeholder="Short and useful. Tell them exactly what to expect when they click."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Click URL" optional>
              <div className="flex items-center rounded-lg border border-border bg-black/60 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]">
                <span className="pl-3 pr-1 text-muted">
                  <LinkIcon />
                </span>
                <input
                  className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-muted/70"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  inputMode="url"
                />
              </div>
            </Field>
            <Field label="Icon URL" optional>
              <div className="flex items-center rounded-lg border border-border bg-black/60 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]">
                <span className="pl-3 pr-1 text-muted">
                  <ImageIcon />
                </span>
                <input
                  className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-muted/70"
                  placeholder="https://…/icon.png"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  inputMode="url"
                />
              </div>
            </Field>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {msg ? (
              <span
                className={
                  "inline-flex items-center gap-2 text-sm " +
                  (msg.ok ? "text-emerald-400" : "text-red-400")
                }
              >
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full " +
                    (msg.ok ? "bg-emerald-400" : "bg-red-400")
                  }
                />
                {msg.text}
              </span>
            ) : (
              <span className="text-[11px] text-muted">
                Sent to <b className="text-white">all</b> subscribers of this site.
              </span>
            )}
            <button
              disabled={loading || disabled}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_-8px_rgba(93,10,209,0.7)] transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Sending…" : "Send now"}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              >
                <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      <NotificationPreview
        title={title || "Your title goes here"}
        body={body || "Your notification body will render exactly like this on the user's device."}
        iconUrl={icon || undefined}
        originHost={originHost}
      />
    </section>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-white">
          {label}
          {optional && <span className="ml-1 text-muted">(optional)</span>}
        </span>
        {hint && <span className="text-[10px] text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
      <path d="M9 11a4 4 0 005.7 0l2.6-2.6a4 4 0 10-5.7-5.7L10 4" strokeLinecap="round" />
      <path d="M11 9a4 4 0 00-5.7 0L2.7 11.6a4 4 0 105.7 5.7L10 16" strokeLinecap="round" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
      <circle cx="7" cy="8" r="1.4" />
      <path d="M3 15l4-4 4 4 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
