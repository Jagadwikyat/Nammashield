"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAppStore } from "@/lib/navigationStore";
import { useDashboardState } from "@/components/namma/DashboardStateProvider";
import { Skeleton } from "@/components/ui/skeleton";

function initials(name: string | null, phone: string | null) {
  if (name && name.trim().length >= 1) {
    const p = name.trim().split(/\s+/);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (phone) return phone.replace(/\D/g, "").slice(-2) || "NS";
  return "NS";
}

export function Topbar() {
  const pathname = usePathname() || "";
  const { role } = useAppStore();
  const { worker, loading } = useDashboardState();

  const title = pathname.includes("/policy")
    ? "Policy Management"
    : pathname.includes("/claims")
      ? "Claims & Payouts"
      : pathname.includes("/calculator")
        ? "Risk Calculator"
        : pathname.includes("/admin")
          ? "Admin Dashboard"
          : "Dashboard";

  const wallet = worker?.wallet_balance ?? 0;
  const ini = initials(worker?.name ?? null, worker?.phone ?? null);

  return (
    <header
      className="fixed top-0 left-[240px] right-0 h-16 flex items-center justify-between px-6 z-10"
      style={{
        background: "var(--background)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-6 min-w-0">
        <h1 className="text-display-md truncate">{title}</h1>
        {loading ? (
          <Skeleton className="h-8 w-28 rounded-md hidden sm:block" />
        ) : (
          <span
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              fontFamily: "var(--font-mono)",
              background: "var(--secondary)",
              color: "var(--foreground)",
            }}
          >
            ₹{Number(wallet).toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
            <span style={{ color: "var(--muted)", fontWeight: 400 }} className="ml-1">
              wallet
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: role === "admin" ? "#FDE8DA" : "var(--accent-light)",
            color: role === "admin" ? "var(--primary)" : "var(--accent)",
          }}
        >
          {role === "admin" ? "Admin Mode" : "Worker"}
        </span>

        <button className="relative p-2 rounded-[var(--radius-sm)] hover:bg-[var(--secondary)] transition-colors">
          <Bell size={18} style={{ color: "var(--muted)" }} />
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          {ini}
        </div>
      </div>
    </header>
  );
}
