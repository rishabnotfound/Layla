"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSendTray, type SendJob } from "./SendTrayProvider";

export default function SendTray() {
  const { jobs, active, unseen, limit, atLimit, markSeen, dismiss, clearDone } = useSendTray();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const has = jobs.length > 0;

  useEffect(() => {
    if (!open) return;
    markSeen();
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, markSeen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notification jobs"
        className={
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition " +
          (open
            ? "border-accent/60 bg-accent/20 text-accent"
            : active.length > 0
              ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15"
              : has
                ? "border-white/15 bg-white/[0.04] text-white/80 hover:border-white/25"
                : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80")
        }
      >
        <BellIcon spinning={active.length > 0} filled={open} />
        <AnimatePresence>
          {unseen > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white shadow"
            >
              {unseen > 9 ? "9+" : unseen}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-x-3 top-[64px] z-50 overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex items-baseline gap-2">
                <div className="text-[12px] font-semibold text-white">Send queue</div>
                <div
                  className={
                    "text-[10px] tabular-nums " +
                    (atLimit ? "text-yellow-400" : "text-white/40")
                  }
                >
                  {active.length}/{limit} active
                </div>
              </div>
              <button
                onClick={clearDone}
                disabled={jobs.every((j) => j.status !== "done" && j.status !== "error")}
                className="text-[11px] text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Clear done
              </button>
            </div>
            {atLimit && (
              <div className="border-b border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-2 text-[11px] text-yellow-300/90">
                Max {limit} sends running at once. Wait for one to finish before sending another.
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto">
              {jobs.length === 0 && (
                <div className="px-4 py-8 text-center text-[12px] text-white/40">
                  No sends in progress.
                </div>
              )}
              <AnimatePresence initial={false}>
                {jobs.map((j) => (
                  <motion.div
                    key={j.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <JobRow job={j} onDismiss={() => dismiss(j.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JobRow({ job, onDismiss }: { job: SendJob; onDismiss: () => void }) {
  const done = job.delivered + job.failed;
  const pct = job.attempted > 0 ? Math.min(100, (done / job.attempted) * 100) : 0;
  const isActive = job.status === "pending" || job.status === "sending";
  const isError = job.status === "error";
  return (
    <div className="border-b border-white/[0.05] px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white">{job.title}</div>
          <div className="mt-0.5 truncate text-[10px] text-white/40">{job.origin}</div>
        </div>
        {!isActive && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-white/30 hover:text-white/80"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between text-[10px]">
        <span className={statusColor(job)}>
          {job.status === "pending" && "Queued"}
          {job.status === "sending" && `Sending · ${done.toLocaleString()} / ${job.attempted.toLocaleString()}`}
          {job.status === "done" && `Done · ${job.delivered.toLocaleString()} / ${job.attempted.toLocaleString()}`}
          {isError && `Failed`}
        </span>
        <span className="tabular-nums text-white/40">
          {job.delivered.toLocaleString()} ok
          {job.failed ? ` · ${job.failed.toLocaleString()} fail` : ""}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={
            "h-full rounded-full transition-[width] duration-500 ease-out " +
            (isError
              ? "bg-red-500/70"
              : job.status === "done"
                ? "bg-emerald-500/70"
                : "bg-gradient-to-r from-accent to-accent/60")
          }
          style={{ width: `${job.status === "done" ? 100 : pct}%` }}
        />
      </div>
      {job.error && (
        <div className="mt-1.5 text-[10px] text-red-400/80">{job.error}</div>
      )}
    </div>
  );
}

function statusColor(j: SendJob) {
  if (j.status === "done") return "text-emerald-400";
  if (j.status === "error") return "text-red-400";
  if (j.status === "sending") return "text-accent";
  return "text-white/60";
}

function BellIcon({ spinning, filled }: { spinning: boolean; filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"h-[18px] w-[18px] " + (spinning ? "animate-[bellwiggle_1.2s_ease-in-out_infinite] origin-top" : "")}
    >
      <path d="M12 3a5.5 5.5 0 00-5.5 5.5v3.2c0 .5-.2 1-.5 1.4l-1.1 1.4a1 1 0 00.8 1.6h12.6a1 1 0 00.8-1.6l-1.1-1.4a2.2 2.2 0 01-.5-1.4V8.5A5.5 5.5 0 0012 3z" />
      <path d="M10 19a2 2 0 004 0" fill="none" />
    </svg>
  );
}
