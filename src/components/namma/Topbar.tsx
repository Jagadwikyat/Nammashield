import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAppStore } from "@/lib/navigationStore";

export function Topbar() {
  const pathname = usePathname() || "";
  const { role } = useAppStore();

  const title = pathname.includes("/policy")
    ? "Policy Management"
    : pathname.includes("/claims")
      ? "Claims & Payouts"
      : pathname.includes("/calculator")
        ? "Risk Calculator"
        : pathname.includes("/admin")
          ? "Admin Dashboard"
          : "Dashboard";

  return (
    <header
      className="fixed top-0 left-[240px] right-0 h-16 flex items-center justify-between px-6 z-10"
      style={{
        background: "var(--background)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <h1 className="text-display-md">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: role === "admin" ? "#FDE8DA" : "var(--accent-light)",
            color: role === "admin" ? "var(--primary)" : "var(--accent)",
          }}
        >
          {role === "admin" ? "Admin Mode" : "Worker"}
        </span>

        {/* Notification bell */}
        <button className="relative p-2 rounded-[var(--radius-sm)] hover:bg-[var(--secondary)] transition-colors">
          <Bell size={18} style={{ color: "var(--muted)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--primary)]" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          AK
        </div>
      </div>
    </header>
  );
}
