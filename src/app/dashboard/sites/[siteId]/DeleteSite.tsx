"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSite({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm("Delete this site and all its subscribers? This can't be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-red-950/60 bg-red-950/10 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
            Danger zone
          </h2>
          <p className="mt-1 text-sm text-muted">
            Deletes this site, its subscribers, and all notification history. No undo.
          </p>
        </div>
        <button
          onClick={del}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900/70 bg-black/40 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M5 6h10M8 6V4h4v2M6 6l1 10h6l1-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {loading ? "Deleting…" : "Delete site"}
        </button>
      </div>
    </div>
  );
}
