"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: string };

export default function StatsHover({ items, className }: { items: Stat[]; className?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4", className)}>
      {items.map((item, idx) => (
        <div
          key={item.label}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-3xl bg-accent/15"
                layoutId="statsHoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>

          <div className="relative z-20 h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black p-6 transition group-hover:border-accent/40">
            <div className="relative z-50">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</div>
              <div className="mt-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent tabular-nums sm:text-4xl">
                {item.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
