"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, LayoutDashboard, FileText, Calculator, Scale } from "lucide-react";
import { useAppStore } from "@/lib/navigationStore";
import { WORKER } from "@/lib/mockData";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/policy", label: "Policy", icon: <FileText size={18} /> },
  { href: "/dashboard/claims", label: "Claims", icon: <Scale size={18} /> },
  { href: "/dashboard/calculator", label: "Calculator", icon: <Calculator size={18} /> },
  { href: "/dashboard/admin", label: "Admin", icon: <Shield size={18} />, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAppStore();

  const filteredNav = navItems.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col"
      style={{
        background: "#FAFAF7",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 hover:opacity-80 transition-opacity">
        <Shield size={28} color="#E85D1A" strokeWidth={2.2} />
        <span className="text-display-md" style={{ color: "#E85D1A", lineHeight: 1 }}>
          Namma<span style={{ color: "#1C1814" }}>Shield</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150 relative"
                style={{
                  fontFamily: "var(--font-body)",
                  color: isActive ? "#1C1814" : "var(--muted)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
                <span className={isActive ? "text-[var(--primary)]" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius)]"
          style={{ background: "var(--secondary)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            {WORKER.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{WORKER.name}</p>
            <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              ₹{WORKER.premium} / week
            </p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-[var(--border)] transition-colors" title="Sign Out">
            <LogOut size={15} style={{ color: "var(--muted)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
