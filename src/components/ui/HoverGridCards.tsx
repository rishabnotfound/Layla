"use client";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export function HoverGridCards({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cards = wrap.querySelectorAll<HTMLElement>("[data-hover-card]");
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      className={cn("group/cards grid gap-3", className)}
    >
      {children}
    </div>
  );
}

export function HoverCard({
  className,
  children,
  as: As = "div",
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
  as?: any;
  [key: string]: any;
}) {
  return (
    <As
      data-hover-card
      className={cn(
        "group/card relative overflow-hidden rounded-xl bg-white/[0.04] transition",
        "before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-500 before:content-['']",
        "before:[background:radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(93,10,209,0.18),transparent_40%)]",
        "hover:before:opacity-100",
        className
      )}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-0 transition-opacity duration-500 [background:radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(93,10,209,0.55),transparent_40%)] group-hover/cards:opacity-100"
      />
      <div className="relative z-[2] m-px h-[calc(100%-2px)] w-[calc(100%-2px)] rounded-[inherit] border border-white/10 bg-panel">
        {children}
      </div>
    </As>
  );
}
