"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAppStore } from "@/lib/navigationStore";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

interface AppShellProps {
  children: React.ReactNode;
  pageKey: string;
}

export function AppShell({ children, pageKey }: AppShellProps) {
  const { currentPage } = useAppStore();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] mt-16 flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div key={pageKey} {...pageTransition}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
