"use client";
import { useState } from "react";

export default function CopySnippetButton({
  siteId,
  appUrl,
}: {
  siteId: string;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script async src="${appUrl}/embed/${siteId}.js"></script>`;

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className={
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition " +
        (copied
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
          : "border-border bg-black/40 text-muted hover:border-accent/60 hover:text-white")
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
          Copy snippet
        </>
      )}
    </button>
  );
}
