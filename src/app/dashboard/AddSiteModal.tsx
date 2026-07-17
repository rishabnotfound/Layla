"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { StatefulButton } from "@/components/ui/StatefulButton";

export function AddSiteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setName("");
      setUrl("");
      setErr(null);
      setLoading(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-modal-open", "true");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.body.removeAttribute("data-modal-open");
    };
  }, [open, onClose]);

  async function submit() {
    setErr(null);
    try {
      const parsed = new URL(url);
      const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost)) {
        setErr("Origin must use HTTPS. Web push doesn't work over HTTP.");
        throw new Error("invalid_protocol");
      }
    } catch (e: any) {
      if (e?.message !== "invalid_protocol") {
        setErr("Enter a valid URL (e.g. https://example.com).");
      }
      throw e;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Failed");
        throw new Error("failed");
      }
      onClose();
      router.push(`/dashboard/sites/${j.siteId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-panel sm:max-w-md sm:rounded-2xl"
          >
            <div className="flex justify-center pt-2.5 sm:hidden">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-accent">New</div>
                <h2 className="mt-0.5 text-base font-semibold text-white">Add a site</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white">
                  Name <span className="text-muted">(optional)</span>
                </span>
                <input
                  className="w-full rounded-lg border border-border bg-black px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]"
                  placeholder="My blog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-white">Origin</span>
                <input
                  className="w-full rounded-lg border border-border bg-black px-3 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  inputMode="url"
                />
                <span className="mt-1.5 block text-[11px] text-muted">
                  Must be HTTPS — web push doesn&apos;t work over HTTP.
                </span>
              </label>

              {err && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                  {err}
                </div>
              )}

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-white/30 hover:text-white"
                >
                  Cancel
                </button>
                <StatefulButton
                  onClick={submit}
                  disabled={loading || !url}
                  className="flex-1 bg-accent text-white hover:bg-accent-hover"
                >
                  {loading ? "Adding…" : "Add site"}
                </StatefulButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
