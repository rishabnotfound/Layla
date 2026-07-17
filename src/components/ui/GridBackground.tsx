"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function GridBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (document.body.hasAttribute("data-modal-open")) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", `-9999px`);
    el.style.setProperty("--my", `-9999px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={hasHover ? onMove : undefined}
      onMouseLeave={hasHover ? onLeave : undefined}
      className={cn("absolute inset-0", className)}
      style={{ ["--mx" as any]: "-9999px", ["--my" as any]: "-9999px" }}
    >
      {/* base grid, masked to a soft ellipse */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:44px_44px]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      {hasHover && (
        <>
          {/* accent grid that only shows around the cursor */}
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#5d0ad1_1px,transparent_1px),linear-gradient(to_bottom,#5d0ad1_1px,transparent_1px)] bg-[size:44px_44px] opacity-70 transition-opacity duration-300"
            style={{
              WebkitMaskImage:
                "radial-gradient(220px circle at var(--mx) var(--my), black 0%, transparent 70%)",
              maskImage:
                "radial-gradient(220px circle at var(--mx) var(--my), black 0%, transparent 70%)",
            }}
          />
          {/* soft purple glow that follows the cursor */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(320px circle at var(--mx) var(--my), rgba(93,10,209,0.18), transparent 65%)",
            }}
          />
        </>
      )}
    </div>
  );
}
