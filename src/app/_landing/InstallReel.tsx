"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const LINES: { prompt: string; text: string; out?: string; tone?: "ok" | "info" }[] = [
  {
    prompt: "1.",
    text: "sign up at layla.wtf → save your 16-digit code",
    out: "→ code: 4829-7301-5566-1044",
    tone: "ok",
  },
  {
    prompt: "2.",
    text: '<script async src="https://layla.wtf/embed/s_abc.js"></script>',
    out: "→ paste before </body> · service worker registers itself",
    tone: "info",
  },
  {
    prompt: "3.",
    text: 'compose title + body in the dashboard → hit send',
    out: "→ 1,284 delivered · 3 failed · 812ms",
    tone: "ok",
  },
];

function Line({
  line,
  active,
}: {
  line: (typeof LINES)[number];
  active: boolean;
}) {
  const full = line.text;
  const [typed, setTyped] = useState("");
  const [showOut, setShowOut] = useState(false);

  useEffect(() => {
    if (!active) {
      setTyped("");
      setShowOut(false);
      return;
    }
    let i = 0;
    setTyped("");
    setShowOut(false);
    const int = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(int);
        setTimeout(() => setShowOut(true), 260);
      }
    }, 22);
    return () => clearInterval(int);
  }, [active, full]);

  return (
    <div className="font-mono text-[11px] leading-relaxed sm:text-[13px]">
      <div className="flex flex-wrap items-baseline gap-2 text-white">
        <span className="text-accent">{line.prompt}</span>
        <span className="break-all">{typed}</span>
        {active && typed.length < full.length && (
          <span className="inline-block h-[12px] w-[6px] translate-y-[2px] animate-pulse bg-white/80 sm:h-[14px] sm:w-[7px]" />
        )}
      </div>
      {line.out && (
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: showOut ? 1 : 0, y: showOut ? 0 : -2 }}
          transition={{ duration: 0.25 }}
          className={
            "break-all pl-4 text-[10px] sm:text-[12px] " +
            (line.tone === "ok"
              ? "text-emerald-400/90"
              : "text-accent/90")
          }
        >
          {line.out}
        </motion.div>
      )}
    </div>
  );
}

export default function InstallReel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    setStep(0);
    const timings = [2400, 2400, 2400];
    let cursor = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((_, i) => {
      if (i === 0) return;
      cursor += timings[i - 1];
      timeouts.push(setTimeout(() => setStep(i), cursor));
    });
    return () => timeouts.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgba(93,10,209,0.3),transparent_70%)] blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-[#08070d] shadow-[0_40px_100px_-20px_rgba(93,10,209,0.35)]">
        <div className="flex items-center justify-between border-b border-border bg-black/40 px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:inline">
            layla — install
          </span>
          <span className="font-mono text-[10px] text-muted">60s</span>
        </div>
        <div className="space-y-4 px-4 py-5 sm:space-y-5 sm:px-8 sm:py-7">
          {LINES.map((l, i) => (
            <div
              key={i}
              className={i > step ? "pointer-events-none opacity-20" : ""}
            >
              <Line line={l} active={i <= step && step >= 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
