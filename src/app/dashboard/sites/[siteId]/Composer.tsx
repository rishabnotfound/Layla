"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationPreview from "./NotificationPreview";
import { StatefulButton } from "@/components/ui/StatefulButton";
import { useSendTray } from "@/app/dashboard/SendTrayProvider";

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
  const tray = useSendTray();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [image, setImage] = useState("");
  const [actions, setActions] = useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const originHost = useMemo(() => {
    try {
      return new URL(origin).host;
    } catch {
      return origin;
    }
  }, [origin]);

  async function send() {
    if (!title.trim() || !body.trim()) {
      setMsg({ ok: false, text: "Title and message are required." });
      throw new Error("invalid");
    }
    const cleanActions = actions
      .map((a) => ({ label: a.label.trim(), url: a.url.trim() }))
      .filter((a) => a.label && a.url);
    if (cleanActions.length !== actions.filter((a) => a.label.trim() || a.url.trim()).length) {
      setMsg({ ok: false, text: "Each button needs both a label and an https URL." });
      throw new Error("invalid");
    }
    setLoading(true);
    setMsg(null);
    try {
      const submitted = { title, body, url, icon, image, actions: cleanActions };
      const res = await fetch(`/api/sites/${siteId}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitted),
      });
      const j = await res.json();
      if (!res.ok) {
        const text =
          j.error === "too_many_active"
            ? `You already have ${j.active}/${j.limit} sends running. Wait for one to finish.`
            : j.error === "no_subscribers"
              ? "This site has no subscribers yet."
              : j.error || "Failed";
        setMsg({ ok: false, text });
        throw new Error("send_failed");
      }
      tray.enqueue({
        id: j.notificationId,
        siteId,
        origin,
        title: submitted.title,
        attempted: j.attempted || 0,
      });
      setMsg({ ok: true, text: "Queued — track progress in the bell above." });
      setTitle("");
      setBody("");
      setUrl("");
      setIcon("");
      setImage("");
      setActions([]);
      setTimeout(() => router.refresh(), 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">New notification</h2>
          {disabled && (
            <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
              No subscribers
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <Field label="Title" hint={`${title.length}/120`}>
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              placeholder="Weekly digest — 5 new posts"
            />
          </Field>

          <Field label="Message" hint={`${body.length}/400`}>
            <textarea
              className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
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
              <input
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                inputMode="url"
              />
            </Field>
            <Field label="Icon URL" optional>
              <input
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                placeholder="https://…/icon.png"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                inputMode="url"
              />
            </Field>
          </div>

          <Field
            label="Poster image URL"
            optional
            hint="Chrome/Android only"
          >
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              placeholder="https://…/poster.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              inputMode="url"
            />
          </Field>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[12px] font-medium text-white/70">
                Buttons <span className="ml-1 text-white/30">(optional, max 2)</span>
              </span>
              <span className="text-[10px] text-white/40">Chrome / Edge / Android</span>
            </div>
            <div className="flex flex-col gap-2">
              {actions.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="w-32 shrink-0 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                    placeholder="Read now"
                    maxLength={24}
                    value={a.label}
                    onChange={(e) => {
                      const next = [...actions];
                      next[i] = { ...next[i], label: e.target.value };
                      setActions(next);
                    }}
                  />
                  <input
                    className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
                    placeholder="https://…"
                    value={a.url}
                    inputMode="url"
                    onChange={(e) => {
                      const next = [...actions];
                      next[i] = { ...next[i], url: e.target.value };
                      setActions(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setActions(actions.filter((_, j) => j !== i))}
                    className="shrink-0 rounded-md border border-white/10 bg-white/[0.03] px-2 text-[12px] text-white/60 transition hover:border-white/25 hover:text-white"
                    aria-label="Remove button"
                  >
                    ×
                  </button>
                </div>
              ))}
              {actions.length < 2 && (
                <button
                  type="button"
                  onClick={() => setActions([...actions, { label: "", url: "" }])}
                  className="self-start rounded-md border border-dashed border-white/15 px-3 py-1.5 text-[11px] text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  + Add button
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
            {msg ? (
              <span
                className={
                  "inline-flex items-center gap-2 text-[12px] " +
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
            ) : tray.atLimit ? (
              <span className="inline-flex items-center gap-2 text-[12px] text-yellow-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Send limit reached ({tray.active.length}/{tray.limit}). Wait for one to finish.
              </span>
            ) : (
              <span className="text-[12px] text-white/40">
                Sends to all subscribers · {tray.active.length}/{tray.limit} in flight
              </span>
            )}
            <StatefulButton
              onClick={send}
              disabled={loading || disabled || !title.trim() || !body.trim() || tray.atLimit}
              className="bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
            >
              {loading ? "Queuing…" : "Send"}
            </StatefulButton>
          </div>
        </div>
      </div>

      <NotificationPreview
        title={title || "Your title goes here"}
        body={body || "Your notification body will render exactly like this on the user's device."}
        iconUrl={icon || undefined}
        imageUrl={image || undefined}
        actions={actions.filter((a) => a.label.trim()).map((a) => a.label.trim())}
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
        <span className="text-[12px] font-medium text-white/70">
          {label}
          {optional && <span className="ml-1 text-white/30">(optional)</span>}
        </span>
        {hint && <span className="text-[10px] tabular-nums text-white/40">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

