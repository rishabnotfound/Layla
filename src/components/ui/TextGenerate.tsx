"use client";
import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function TextGenerate({
  words,
  className,
  duration = 0.4,
}: {
  words: string;
  className?: string;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  useEffect(() => {
    animate("span", { opacity: 1 }, { duration, delay: stagger(0.08) });
  }, [animate, duration]);

  return (
    <div className={cn("font-semibold", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span key={word + idx} className="opacity-0">
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
