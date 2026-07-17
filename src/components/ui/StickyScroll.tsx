"use client";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { title: string; description: string; content?: React.ReactNode };

export function StickyScroll({
  content,
  contentClassName,
}: {
  content: Item[];
  contentClassName?: string;
}) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardLength = content.length;
    const cardsBreakpoints = content.map((_, i) => i / cardLength);
    const idx = cardsBreakpoints
      .map((bp, i) => (latest > bp - 0.25 && latest <= bp + 0.5 ? i : -1))
      .filter((i) => i !== -1)
      .pop();
    if (idx !== undefined) setActive(idx);
  });

  return (
    <motion.div
      ref={ref}
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-2xl border border-border bg-black p-10"
    >
      <div className="relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, i) => (
            <div key={item.title + i} className="my-16">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: active === i ? 1 : 0.3 }}
                className="text-2xl font-bold text-white"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: active === i ? 1 : 0.3 }}
                className="mt-3 max-w-sm text-muted"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "sticky top-10 hidden h-60 w-96 overflow-hidden rounded-lg border border-border bg-panel lg:block",
          contentClassName
        )}
      >
        {content[active]?.content ?? null}
      </div>
    </motion.div>
  );
}
