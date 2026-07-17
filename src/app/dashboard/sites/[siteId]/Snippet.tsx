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
    <div className="rounded-xl border border-border bg-panel p-4 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-sm font-semibold text-white">Install snippet</h2>
        <p className="text-xs text-muted">
          Paste before <code className="rounded bg-black/60 px-1 py-0.5 text-[11px]">&lt;/body&gt;</code>.
        </p>
      </div>

      <div className="relative mt-4">
        <pre className="overflow-x-auto rounded-lg border border-border bg-black p-3 pr-24 text-xs leading-relaxed sm:p-4">
          <code className="text-white/90">{snippet}</code>
        </pre>
        <button
          onClick={copy}
          className={
            "absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition " +
            (copied
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
              : "border-border bg-panel text-muted hover:border-accent hover:text-white")
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
