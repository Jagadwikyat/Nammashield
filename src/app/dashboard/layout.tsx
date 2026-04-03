"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/namma/Sidebar";
import { Topbar } from "@/components/namma/Topbar";
import { DashboardStateProvider } from "@/components/namma/DashboardStateProvider";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

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
  const router = useRouter();
  const { isAuthenticated, isLoading, rehydrate, workerId } = useAuthStore();

  // Rehydrate auth state from localStorage on mount
  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  // Background GPS ping every 5 minutes (silent if denied / unavailable)
  useEffect(() => {
    if (!isAuthenticated || !workerId) return;

    const send = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void fetch("/api/gps/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              worker_id: workerId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              is_active: true,
            }),
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 120_000, timeout: 15_000 }
      );
    };

    send();
    const id = window.setInterval(send, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, workerId]);

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/onboarding");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while checking auth state
  if (isLoading || !isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardStateProvider>
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
    </DashboardStateProvider>
  );
}
