"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Dir = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

const rotate: Record<Dir, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, #5d0ad1 0%, rgba(255,255,255,0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #5d0ad1 0%, rgba(255,255,255,0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #5d0ad1 0%, rgba(255,255,255,0) 100%)",
  RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, #5d0ad1 0%, rgba(255,255,255,0) 100%)",
};

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1.4,
  ...props
}: React.PropsWithChildren<{
  containerClassName?: string;
  className?: string;
  as?: any;
  duration?: number;
} & any>) {
  const [hovered, setHovered] = useState(false);
  const [dir, setDir] = useState<Dir>("TOP");

  useEffect(() => {
    if (hovered) return;
    const order: Dir[] = ["TOP", "RIGHT", "BOTTOM", "LEFT"];
    const t = setInterval(() => {
      setDir((d) => order[(order.indexOf(d) + 1) % order.length]);
    }, duration * 1000);
    return () => clearInterval(t);
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit items-center justify-center overflow-visible rounded-full border border-border bg-black/50 p-px transition duration-500",
        containerClassName
      )}
      {...props}
    >
      <div className={cn("z-10 rounded-[inherit] bg-black px-5 py-2 text-sm font-medium text-white", className)}>
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)", background: rotate[dir] }}
        initial={{ background: rotate.TOP }}
        animate={{ background: hovered ? "radial-gradient(75% 181.15% at 50% 50%, #5d0ad1 0%, rgba(255,255,255,0) 100%)" : rotate[dir] }}
        transition={{ ease: "linear", duration }}
      />
      <div className="absolute inset-[1px] z-[1] rounded-[100px] bg-black" />
    </Tag>
  );
}
