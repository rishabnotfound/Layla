"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export function TosModal({
  open,
  onAccept,
  onReject,
}: {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setAgreed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onReject();
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
  }, [open, onReject]);

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
            onClick={onReject}
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
            className="relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-panel sm:max-w-md sm:rounded-2xl"
          >
            <div className="flex justify-center pt-2.5 sm:hidden">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-accent">Terms</div>
                <h2 className="mt-0.5 text-base font-semibold text-white">Before you continue</h2>
              </div>
              <button
                onClick={onReject}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-muted">
              <p className="text-white">By creating an account you agree:</p>
              <ul className="mt-3 space-y-2.5">
                <Rule>
                  <b className="text-white">No spam.</b> Don&apos;t send unsolicited or excessive notifications.
                  Keep it to what your visitors opted in for.
                </Rule>
                <Rule>
                  <b className="text-white">No scams or phishing.</b> No fake system messages, fake giveaways,
                  crypto scams, or misleading titles.
                </Rule>
                <Rule>
                  <b className="text-white">Own the domain.</b> Only register origins you control. Subscriptions
                  are origin-locked on the server.
                </Rule>
                <Rule>
                  <b className="text-white">Your code is your account.</b> Lose it and it&apos;s gone forever —
                  no recovery.
                </Rule>
              </ul>
              <p className="mt-4 text-xs">
                Full details:{" "}
                <Link
                  href="/tos"
                  target="_blank"
                  className="text-accent underline underline-offset-2 hover:text-accent-hover"
                >
                  read the full Terms of Service
                </Link>
                .
              </p>
            </div>

            <div className="border-t border-border/60 px-5 py-4">
              <label className="flex cursor-pointer items-start gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                />
                <span>
                  I&apos;ve read and agree to the{" "}
                  <Link href="/tos" target="_blank" className="text-accent hover:text-accent-hover">
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onReject}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-white/30 hover:text-white"
                >
                  Reject
                </button>
                <button
                  onClick={onAccept}
                  disabled={!agreed}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}
