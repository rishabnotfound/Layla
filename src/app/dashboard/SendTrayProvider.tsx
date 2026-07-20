"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MAX_ACTIVE_JOBS_PER_USER } from "@/lib/limits";

export type SendJob = {
  id: string;
  siteId: string;
  origin: string;
  title: string;
  status: "pending" | "sending" | "done" | "error";
  attempted: number;
  delivered: number;
  failed: number;
  error?: string | null;
  startedAt: number;
  finishedAt?: number;
};

type Ctx = {
  jobs: SendJob[];
  active: SendJob[];
  unseen: number;
  limit: number;
  atLimit: boolean;
  markSeen: () => void;
  enqueue: (input: {
    id: string;
    siteId: string;
    origin: string;
    title: string;
    attempted: number;
  }) => void;
  dismiss: (id: string) => void;
  clearDone: () => void;
};

const SendTrayCtx = createContext<Ctx | null>(null);

export function useSendTray() {
  const c = useContext(SendTrayCtx);
  if (!c) throw new Error("useSendTray outside <SendTrayProvider>");
  return c;
}

const POLL_MS = 1000;
const KEEP_DONE_MS = 15_000;

export default function SendTrayProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<SendJob[]>([]);
  const [unseen, setUnseen] = useState(0);
  const jobsRef = useRef<SendJob[]>([]);
  jobsRef.current = jobs;

  const markSeen = useCallback(() => setUnseen(0), []);

  const enqueue = useCallback<Ctx["enqueue"]>((input) => {
    setJobs((prev) => [
      {
        ...input,
        status: "pending",
        delivered: 0,
        failed: 0,
        startedAt: Date.now(),
      },
      ...prev.filter((j) => j.id !== input.id),
    ]);
    setUnseen((n) => n + 1);
  }, []);

  const dismiss = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== "done" && j.status !== "error"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/notifications/active", { cache: "no-store" });
        if (!r.ok) return;
        const { jobs: fetched } = (await r.json()) as { jobs: SendJob[] };
        if (cancelled || !Array.isArray(fetched)) return;
        setJobs((prev) => {
          const known = new Set(prev.map((j) => j.id));
          const additions = fetched.filter((j) => !known.has(j.id));
          if (additions.length === 0) return prev;
          return [...additions, ...prev];
        });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(async () => {
      const active = jobsRef.current.filter(
        (j) => j.status === "pending" || j.status === "sending",
      );
      if (active.length === 0) {
        setJobs((prev) => {
          const now = Date.now();
          const next = prev.filter(
            (j) =>
              (j.status !== "done" && j.status !== "error") ||
              !j.finishedAt ||
              now - j.finishedAt < KEEP_DONE_MS,
          );
          return next.length === prev.length ? prev : next;
        });
        return;
      }

      const updates = await Promise.all(
        active.map(async (j) => {
          try {
            const r = await fetch(
              `/api/sites/${j.siteId}/notifications/${j.id}/progress`,
              { cache: "no-store" },
            );
            if (!r.ok) return null;
            const p = (await r.json()) as {
              status: SendJob["status"];
              attempted: number;
              delivered: number;
              failed: number;
              error: string | null;
            };
            return { id: j.id, ...p };
          } catch {
            return null;
          }
        }),
      );

      setJobs((prev) => {
        const now = Date.now();
        return prev
          .map((j) => {
            const u = updates.find((x) => x && x.id === j.id);
            if (!u) return j;
            const finished =
              (u.status === "done" || u.status === "error") &&
              j.status !== "done" &&
              j.status !== "error";
            return {
              ...j,
              status: u.error ? "error" : u.status,
              attempted: u.attempted,
              delivered: u.delivered,
              failed: u.failed,
              error: u.error,
              finishedAt: finished ? now : j.finishedAt,
            };
          })
          .filter(
            (j) =>
              (j.status !== "done" && j.status !== "error") ||
              !j.finishedAt ||
              now - j.finishedAt < KEEP_DONE_MS,
          );
      });
    }, POLL_MS);

    return () => clearInterval(t);
  }, []);

  const active = jobs.filter((j) => j.status === "pending" || j.status === "sending");
  const limit = MAX_ACTIVE_JOBS_PER_USER;
  const atLimit = active.length >= limit;

  return (
    <SendTrayCtx.Provider
      value={{ jobs, active, unseen, limit, atLimit, markSeen, enqueue, dismiss, clearDone }}
    >
      {children}
    </SendTrayCtx.Provider>
  );
}
