"use client";

import { Sidebar } from "@/components/namma/Sidebar";
import { Topbar } from "@/components/namma/Topbar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] mt-16 flex-1 p-6 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
