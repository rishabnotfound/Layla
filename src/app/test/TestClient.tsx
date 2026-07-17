"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Site = { siteId: string; name?: string | null; origin: string; verified?: boolean };

type Log = { at: string; msg: string; kind: "info" | "ok" | "err" };

export default function TestClient({ sites }: { sites: Site[] }) {
  const [currentOrigin, setCurrentOrigin] = useState("");
  useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);
  const matching = useMemo(
    () => (currentOrigin ? sites.filter((s) => s.origin === currentOrigin) : []),
    [sites, currentOrigin]
  );

  const [selected, setSelected] = useState<string>("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [creatingLocal, setCreatingLocal] = useState(false);

  const [title, setTitle] = useState("Hello from Layla");
  const [body, setBody] = useState("This is a test push notification.");
  const [url, setUrl] = useState("");

  const scriptRef = useRef<HTMLScriptElement | null>(null);

  function log(msg: string, kind: Log["kind"] = "info") {
    setLogs((l) => [{ at: new Date().toLocaleTimeString(), msg, kind }, ...l].slice(0, 40));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      log("This browser does not support Web Push.", "err");
      return;
    }
    setPermission(Notification.permission);
    if (matching.length > 0 && !selected) setSelected(matching[0].siteId);
  }, [matching, selected]);

  useEffect(() => {
    if (!selected) return;
    refreshSubStatus(selected);
  }, [selected]);

  async function refreshSubStatus(siteId: string) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setSubscribed(!!sub);
      const r = await fetch(`/api/test/site-stats?siteId=${encodeURIComponent(siteId)}`);
      if (r.ok) {
        const j = await r.json();
        setSubCount(j.subs);
      }
    } catch {}
  }

  async function createLocalSite() {
    setCreatingLocal(true);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Local test", url: currentOrigin }),
    });
    setCreatingLocal(false);
    if (res.ok) {
      log("Created localhost site — reloading.", "ok");
      location.reload();
    } else {
      const j = await res.json().catch(() => ({}));
      log("Failed to create site: " + (j.error || res.status), "err");
    }
  }

  function loadEmbed() {
    if (!selected) return;
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = `${currentOrigin}/embed/${selected}.js?t=${Date.now()}`;
    s.onload = () => {
      log("Embed script loaded. Click anywhere on the page to grant permission (if prompted).", "ok");
    };
    s.onerror = () => log("Embed failed to load.", "err");
    document.body.appendChild(s);
    scriptRef.current = s;
  }

  async function askPermission() {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const p = await Notification.requestPermission();
    setPermission(p);
    log("Permission: " + p, p === "granted" ? "ok" : "err");
    return p;
  }

  async function subscribeNow() {
    if (!selected) {
      log("No site selected", "err");
      return;
    }
    log("Step 1: checking browser capabilities…");
    if (!("serviceWorker" in navigator)) return log("navigator.serviceWorker missing", "err");
    if (!("PushManager" in window)) return log("window.PushManager missing", "err");
    if (!("Notification" in window)) return log("window.Notification missing", "err");

    log("Step 2: requesting permission… (current: " + Notification.permission + ")");
    let perm: NotificationPermission = Notification.permission;
    if (perm !== "granted") {
      try {
        perm = await Notification.requestPermission();
      } catch (e: any) {
        return log("requestPermission threw: " + e.message, "err");
      }
      setPermission(perm);
    }
    if (perm !== "granted") return log("Permission not granted: " + perm, "err");
    log("Permission granted.", "ok");

    log("Step 3: registering service worker at " + currentOrigin + "/sw.js …");
    let reg: ServiceWorkerRegistration;
    try {
      reg = await navigator.serviceWorker.register(`${currentOrigin}/sw.js`, { scope: "/" });
    } catch (e: any) {
      return log("register threw: " + e.message, "err");
    }
    log("SW registered. Waiting for ready…", "ok");
    try {
      await navigator.serviceWorker.ready;
    } catch (e: any) {
      return log("serviceWorker.ready threw: " + e.message, "err");
    }
    log("SW ready.", "ok");

    log("Step 4: fetching VAPID public key…");
    let publicKey = "";
    try {
      const r = await fetch("/api/vapid");
      const j = await r.json();
      publicKey = j.publicKey;
    } catch (e: any) {
      return log("VAPID fetch threw: " + e.message, "err");
    }
    if (!publicKey) return log("Server returned empty VAPID key", "err");
    log("Got VAPID key (" + publicKey.length + " chars)", "ok");

    log("Step 5: calling pushManager.subscribe…");
    let sub: PushSubscription | null = null;
    try {
      sub = await reg.pushManager.getSubscription();
      if (sub) {
        log("Reusing existing browser subscription");
      } else {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8(publicKey),
        });
        log("New subscription created", "ok");
      }
    } catch (e: any) {
      log("pushManager.subscribe threw: " + (e.name || "") + " " + e.message, "err");
      if (e.name === "AbortError") {
        log("→ Browser blocked the push service. Common causes:", "err");
        log("  • Brave: enable brave://settings/privacy → 'Use Google services for push messaging', then fully quit + reopen", "err");
        log("  • Private / Incognito / Tor tabs never allow push (browser policy)", "err");
        log("  • Corporate network / VPN blocking fcm.googleapis.com", "err");
      }
      return;
    }
    if (!sub) return log("subscribe returned null", "err");
    log("Endpoint: " + sub.endpoint.slice(0, 80) + "…", "ok");

    log("Step 6: POST /api/subscribe …");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: selected, origin: currentOrigin, subscription: sub.toJSON() }),
      });
      const bodyText = await res.text();
      log(`POST /api/subscribe -> HTTP ${res.status} ${bodyText}`, res.ok ? "ok" : "err");
      if (res.ok) {
        setSubscribed(true);
        refreshSubStatus(selected);
      }
    } catch (e: any) {
      log("POST /api/subscribe threw: " + e.message, "err");
    }
  }

  function b64ToUint8(b64: string) {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(s);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function sendTest() {
    if (!selected) return;
    log("Sending push…");
    const res = await fetch(`/api/sites/${selected}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url }),
    });
    const j = await res.json();
    if (res.ok) {
      log(`Sent. Delivered ${j.delivered}/${j.attempted}.`, j.delivered ? "ok" : "err");
      if (j.errors && j.errors.length) {
        for (const err of j.errors) {
          log(`push err [${err.status ?? "?"}] ${err.message}`, "err");
        }
      }
    } else {
      log("Send failed: " + (j.error || res.status), "err");
    }
    refreshSubStatus(selected);
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await sub.unsubscribe();
        log("Unsubscribed from browser.", "ok");
      }
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      log("Service workers unregistered.", "ok");
      setSubscribed(false);
    } catch (e: any) {
      log("Unsubscribe error: " + e.message, "err");
    }
  }

  const canTest = matching.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-muted hover:text-white">← Dashboard</Link>
        <span className="text-xs text-muted">Testing page</span>
      </div>

      <h1 className="text-2xl font-semibold">Push tester</h1>
      <p className="mt-1 text-sm text-muted">
        Emulates a customer site running the Layla snippet. Your browser origin is{" "}
        <code className="text-white">{currentOrigin}</code>.
      </p>

      {!currentOrigin && (
        <div className="card mt-6 text-sm text-muted">Loading…</div>
      )}

      {currentOrigin && !canTest && (
        <div className="card mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Setup needed</h2>
          <p className="mt-2 text-sm">
            None of your sites are registered with origin <code>{currentOrigin}</code>. The subscribe API rejects
            mismatched origins. Create a local test site to continue.
          </p>
          <button onClick={createLocalSite} disabled={creatingLocal} className="btn-primary mt-4">
            {creatingLocal ? "Creating…" : `Create site for ${currentOrigin}`}
          </button>
        </div>
      )}

      {currentOrigin && canTest && (
        <>
          <div className="card mt-6">
            <label className="label">Site to test</label>
            <select
              className="field"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {matching.map((s) => (
                <option key={s.siteId} value={s.siteId}>
                  {(s.name || s.origin) + "  ·  " + s.siteId}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="Permission" value={permission} good={permission === "granted"} bad={permission === "denied" || permission === "unsupported"} />
              <Stat label="Browser sub" value={subscribed ? "yes" : "no"} good={subscribed} />
              <Stat label="Server subs" value={subCount === null ? "…" : String(subCount)} good={(subCount ?? 0) > 0} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={loadEmbed} className="btn-ghost">Load embed</button>
              <button onClick={subscribeNow} className="btn-primary">Subscribe this browser</button>
              <button onClick={() => selected && refreshSubStatus(selected)} className="btn-ghost">
                Refresh status
              </button>
              <button onClick={unsubscribe} className="btn-ghost">Unsubscribe</button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Click <b>Subscribe this browser</b> to register directly. Browser will prompt for permission.
            </p>
          </div>

          <div className="card mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Send a push</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <label className="label">Title</label>
                <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Body</label>
                <textarea className="field" rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <div>
                <label className="label">Click URL (optional)</label>
                <input className="field" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <button onClick={sendTest} className="btn-primary">
                Send push
              </button>
              {!subscribed && (
                <p className="text-xs text-muted">
                  No browser subscription yet — click <b>Subscribe this browser</b> above first, or send anyway to
                  test with existing server subscribers.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="card mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Log</h2>
        <div className="mt-3 space-y-1 font-mono text-xs">
          {logs.length === 0 && <div className="text-muted">Nothing yet.</div>}
          {logs.map((l, i) => (
            <div key={i} className={
              l.kind === "ok" ? "text-accent" : l.kind === "err" ? "text-red-400" : "text-white"
            }>
              <span className="text-muted">{l.at}</span> · {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className={
      "rounded-md border p-3 " +
      (good ? "border-accent-soft" : bad ? "border-red-900" : "border-border")
    }>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
