"use client";
import { useState } from "react";

export default function SnippetPreview() {
  const [copied, setCopied] = useState(false);
  const code = `<script async src="https://layla.wtf/embed/YOUR_SITE_ID.js"></script>`;

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-accent/40 via-transparent to-accent/40 opacity-70 blur-lg" />
      <div className="relative rounded-2xl border border-border bg-panel p-1">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            index.html
          </span>
          <button
            onClick={copy}
            className="rounded-md border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted transition hover:border-accent hover:text-white"
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto p-5 text-left font-mono text-sm">
          <code className="text-white">
            <span className="text-muted">&lt;</span>
            <span className="text-accent">script</span>{" "}
            <span className="text-white/70">async</span>{" "}
            <span className="text-white/70">src</span>=
            <span className="text-emerald-300">
              &quot;https://layla.wtf/embed/YOUR_SITE_ID.js&quot;
            </span>
            <span className="text-muted">&gt;</span>
            <span className="text-muted">&lt;/</span>
            <span className="text-accent">script</span>
            <span className="text-muted">&gt;</span>
          </code>
        </pre>
      </div>
    </div>
  );
}
