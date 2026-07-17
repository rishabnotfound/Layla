"use client";
import { useState } from "react";
import { AddSiteModal } from "./AddSiteModal";

export default function AddSiteButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_30px_-8px_rgba(93,10,209,0.7)] transition hover:bg-accent-hover"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
        >
          <path d="M10 4v12M4 10h12" strokeLinecap="round" />
        </svg>
        Add site
      </button>
      <AddSiteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
