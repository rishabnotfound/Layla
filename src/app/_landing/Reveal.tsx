"use client";
import { motion } from "framer-motion";

export default function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "h2" | "p" | "span" | "li";
  className?: string;
}) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
