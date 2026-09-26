"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <div ref={ref} className="relative">
      <motion.div style={{ y, opacity, scale }}>{children}</motion.div>
    </div>
  );
}
