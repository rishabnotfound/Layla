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
    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03]">
      <div className="flex flex-col gap-3 border-b border-red-500/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-white">Danger zone</h2>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-white/60">
          Deletes this site, its subscribers, and all notification history. This can&apos;t be undone.
        </p>
        <button
          onClick={del}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Deleting…" : "Delete site"}
        </button>
      </div>
    </div>
  );
}
