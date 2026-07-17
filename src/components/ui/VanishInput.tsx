"use client";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  type?: string;
  autoFocus?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  onEnter?: () => void;
};

type Particle = { x: number; y: number; r: number; color: string };

export function VanishInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  type = "text",
  autoFocus,
  inputMode,
  autoComplete,
  onEnter,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });
  const [animating, setAnimating] = useState(false);

  const paintParticles = (pos: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);
    for (const p of particlesRef.current) {
      if (p.x > pos) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      }
    }
  };

  const buildParticles = useCallback(() => {
    const input = inputRef.current;
    const canvas = canvasRef.current;
    if (!input || !canvas) return 0;
    const rect = input.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    sizeRef.current = { w, h, dpr };
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cs = getComputedStyle(input);
    const fontSize = parseFloat(cs.fontSize);
    const padLeft = parseFloat(cs.paddingLeft || "16");
    ctx.font = `${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(value, padLeft, h / 2);

    const img = ctx.getImageData(0, 0, w * dpr, h * dpr);
    const data = img.data;
    const particles: Particle[] = [];
    let maxX = 0;
    for (let y = 0; y < h * dpr; y += 2) {
      for (let x = 0; x < w * dpr; x += 2) {
        const i = (y * w * dpr + x) * 4;
        const a = data[i + 3];
        if (a > 40) {
          const px = x / dpr;
          const py = y / dpr;
          if (px > maxX) maxX = px;
          particles.push({
            x: px,
            y: py,
            r: 1,
            color: `rgba(255, 255, 255, ${a / 255})`,
          });
        }
      }
    }
    particlesRef.current = particles;
    return maxX;
  }, [value]);

  const animate = (start: number) => {
    const step = (pos: number) => {
      requestAnimationFrame(() => {
        const next: Particle[] = [];
        for (const p of particlesRef.current) {
          if (p.x < pos) {
            next.push(p);
          } else {
            if (p.r <= 0) continue;
            p.x += Math.random() > 0.5 ? 2 : -2;
            p.y += Math.random() > 0.5 ? 2 : -2;
            p.r -= 0.2 * Math.random();
            next.push(p);
          }
        }
        particlesRef.current = next;
        paintParticles(pos);
        if (next.length > 0) {
          step(pos - 24);
        } else {
          setAnimating(false);
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    };
    step(start);
  };

  const runClear = () => {
    if (!value || animating) return;
    const maxX = buildParticles();
    if (!maxX) {
      onChange("");
      return;
    }
    setAnimating(true);
    onChange("");
    animate(maxX);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          if (!animating) onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter && !animating) onEnter();
        }}
        placeholder={animating ? "" : placeholder}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(
          "relative z-0 w-full rounded-lg border border-border bg-black/60 px-4 py-3 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(93,10,209,0.2)]",
          animating && "text-transparent caret-transparent",
          inputClassName
        )}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0 z-10"
      />
      <button
        type="button"
        onClick={runClear}
        aria-label="Clear"
        tabIndex={value && !animating ? 0 : -1}
        className={cn(
          "absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-opacity duration-150 hover:bg-white/5 hover:text-white",
          value && !animating ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
