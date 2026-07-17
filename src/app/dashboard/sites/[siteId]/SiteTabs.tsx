"use client";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

type TabId = "compose" | "overview" | "install" | "settings";

const TABS: { id: TabId; label: string }[] = [
  { id: "compose", label: "Compose" },
  { id: "overview", label: "Overview" },
  { id: "install", label: "Install" },
  { id: "settings", label: "Settings" },
];

export default function SiteTabs({
  compose,
  overview,
  install,
  settings,
}: {
  compose: React.ReactNode;
  overview: React.ReactNode;
  install: React.ReactNode;
  settings: React.ReactNode;
}) {
  const [active, setActive] = useState<TabId>("compose");

  const panels: Record<TabId, React.ReactNode> = {
    compose,
    overview,
    install,
    settings,
  };

  return (
    <div>
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-white/[0.08] bg-black/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <LayoutGroup id="site-tabs">
          <div role="tablist" className="scrollbar-none flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.id)}
                  className={
                    "relative shrink-0 px-3 py-3 text-[13px] font-medium transition-colors " +
                    (isActive ? "text-white" : "text-white/50 hover:text-white/80")
                  }
                >
                  {t.label}
                  {isActive && (
                    <motion.span
                      layoutId="site-tab-underline"
                      className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {panels[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
