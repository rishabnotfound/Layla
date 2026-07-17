"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion, useAnimate } from "framer-motion";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  status?: "idle" | "loading" | "success" | "error";
  layoutId?: string;
}

export function StatefulButton({
  className,
  children,
  status = "idle",
  layoutId,
  ...props
}: Props) {
  const [scope, animate] = useAnimate();

  const animateLoading = async () => {
    await animate(
      ".sb-loader",
      { width: "18px", scale: 1, display: "block" },
      { duration: 0.2 }
    );
  };

  const animateSuccess = async () => {
    await animate(
      ".sb-loader",
      { width: "0px", scale: 0, display: "none" },
      { duration: 0.2 }
    );
    await animate(
      ".sb-check",
      { width: "18px", scale: 1, display: "block" },
      { duration: 0.2 }
    );
    await animate(
      ".sb-check",
      { width: "0px", scale: 0, display: "none" },
      { delay: 1.6, duration: 0.2 }
    );
  };

  const resetLoader = async () => {
    await animate(
      ".sb-loader",
      { width: "0px", scale: 0, display: "none" },
      { duration: 0.15 }
    );
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.disabled) return;
    await animateLoading();
    try {
      const result = props.onClick?.(event);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        await result;
      }
      await animateSuccess();
    } catch {
      await resetLoader();
    }
  };

  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      layout
      layoutId={layoutId}
      ref={scope}
      className={cn(
        "relative flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...buttonProps}
      onClick={handleClick}
    >
      <motion.div layout className="flex items-center gap-2">
        <Loader />
        <CheckIcon />
        <motion.span layout>{children}</motion.span>
      </motion.div>
    </motion.button>
  );
}

function Loader() {
  return (
    <motion.svg
      animate={{ rotate: [0, 360] }}
      initial={{ scale: 0, width: 0, display: "none" }}
      style={{ scale: 0.5, display: "none" }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sb-loader"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
}

function CheckIcon() {
  return (
    <motion.svg
      initial={{ scale: 0, width: 0, display: "none" }}
      style={{ scale: 0.5, display: "none" }}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sb-check"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
}
