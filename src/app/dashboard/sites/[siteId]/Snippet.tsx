"use client";
import { useState } from "react";

export default function Snippet({ siteId, appUrl }: { siteId: string; appUrl: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script async src="${appUrl}/embed/${siteId}.js"></script>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <div className="flex flex-col gap-1 border-b border-white/[0.06] px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-sm font-semibold text-white">Install snippet</h2>
        <p className="text-[12px] text-white/50">
          Paste before <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[11px] text-white/80">&lt;/body&gt;</code>
        </p>
      </div>

      <div className="relative p-5">
        <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/60 p-4 pr-24 font-mono text-[12px] leading-relaxed text-white/80">
          <code>{snippet}</code>
        </pre>
        <button
          onClick={copy}
          className={
            "absolute right-7 top-7 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition " +
            (copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white")
          }
        >
          {copied ? (
            <>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3 w-3">
                <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
                <rect x="6" y="6" width="10" height="10" rx="2" />
                <path d="M4 14V5a1 1 0 011-1h9" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
