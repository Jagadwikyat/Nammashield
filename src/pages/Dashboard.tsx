"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Shield,
  FileText,
  Calculator,
  Scale,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/lib/navigationStore";
import { WORKER, TRIGGERS, PAYOUTS } from "@/lib/mockData";
import { CountUp } from "@/components/namma/CountUp";
import { RiskRing } from "@/components/namma/RiskRing";
import { SegmentBar } from "@/components/namma/SegmentBar";
import { TriggerRow } from "@/components/namma/TriggerRow";

/* ---------- animation helpers ---------- */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";
const cardHover =
  "hover:shadow-[0_8px_32px_rgba(28,24,20,0.12)] hover:-translate-y-0.5 transition-all duration-200";

/* ---------- sub-components ---------- */

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`bg-white rounded-xl p-6 ${cardHover} ${className}`}
      style={{ boxShadow: cardShadow }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- main component ---------- */

export default function Dashboard() {
  const router = useRouter();
  const coverageUsedPct =
    WORKER.maxCoverage > 0
      ? Math.round((WORKER.coverageUsed / WORKER.maxCoverage) * 100)
      : 0;
  const coverageSegments = Math.round((coverageUsedPct / 100) * 20);

  // Last 3 payout rows to show variety
  const recentPayouts = PAYOUTS.slice(-3);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* ============ ROW 1 — STATUS HERO ============ */}
      <Card>
        <div className="flex items-center justify-between gap-6">
          {/* Left */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="text-[28px] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Good morning, Arjun.
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                Active
              </span>
            </div>

            <p
              className="text-sm"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              Your coverage is active for this week.
            </p>

            <div className="space-y-2 max-w-md">
              <SegmentBar segments={20} filled={coverageSegments} />
              <p
                className="text-xs"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{WORKER.maxCoverage.toLocaleString("en-IN")} max this week
              </p>
            </div>
          </div>

          {/* Right — animated shield */}
          <div className="hidden sm:flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as any }}
            >
              <Shield size={64} color="#E85D1A" strokeWidth={1.6} />
            </motion.div>
          </div>
        </div>
      </Card>

      {/* ============ ROW 2 — STATS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 — This Week's Risk */}
        <Card delay={0.05}>
          <div className="flex items-center gap-5">
            <div className="relative">
              <RiskRing
                score={WORKER.riskScore}
                size={84}
                strokeWidth={6}
                showLabel={false}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ marginTop: -8 }}
              >
                <span
                  className="text-mono-sm"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#E85D1A",
                  }}
                >
                  {WORKER.riskScore}/100
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                This Week&apos;s Risk
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: "#E85D1A" }}
              >
                Standard Risk
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                Monsoon forecast for Thurs
              </p>
            </div>
          </div>
        </Card>

        {/* Card 2 — Premium Paid */}
        <Card delay={0.1}>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Premium Paid
          </p>
          <div className="flex items-end gap-2">
            <span
              className="text-mono-lg"
              style={{ fontFamily: "var(--font-mono)", fontSize: "2rem" }}
            >
              <CountUp prefix="₹" end={WORKER.premium} />
            </span>
            <span
              className="text-sm mb-1"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              this week
            </span>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
              🔥 {WORKER.streak} week streak
            </span>
          </div>
        </Card>

        {/* Card 3 — Coverage Remaining */}
        <Card delay={0.15}>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            Coverage Remaining
          </p>
          <div className="flex items-end gap-2">
            <span
              className="text-mono-lg"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "2rem",
                color: "#16A34A",
              }}
            >
              ₹
              <CountUp end={WORKER.maxCoverage - WORKER.coverageUsed} />
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-[6px] rounded-full w-full bg-[var(--border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#16A34A]"
                initial={{ width: 0 }}
                animate={{ width: `${coverageUsedPct}%` }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
              />
            </div>
            <p
              className="text-xs text-right"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {coverageUsedPct}% used this week
            </p>
          </div>
        </Card>
      </div>

      {/* ============ ROW 3 — DISRUPTION MONITOR + QUICK ACTIONS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disruption Monitor (2/3) */}
        <Card className="lg:col-span-2" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-medium"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Live Trigger Feed
            </h3>
            <p
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Last updated 2 min ago
            </p>
          </div>
          <div className="space-y-1">
            {TRIGGERS.map((t) => (
              <TriggerRow
                key={t.name}
                icon={t.icon}
                name={t.name}
                current={t.current}
                threshold={t.threshold}
                status={t.status}
              />
            ))}
          </div>
        </Card>

        {/* Quick Actions (1/3) */}
        <Card delay={0.25}>
          <h3
            className="text-base font-medium mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/dashboard/policy")}
              className="px-4 py-3 rounded-lg border border-[#E2D9CF] bg-[#F0EBE3] text-[#1C1814] font-medium text-sm hover:bg-[#E2D9CF] transition-all flex items-center justify-center gap-2"
            >
              <FileText size={15} />
              View Policy
            </button>
            <button
              onClick={() => router.push("/dashboard/claims")}
              className="px-4 py-3 rounded-lg border border-[#E2D9CF] bg-[#F0EBE3] text-[#1C1814] font-medium text-sm hover:bg-[#E2D9CF] transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={15} />
              Payout History
            </button>
            <button
              onClick={() => router.push("/dashboard/policy")}
              className="px-4 py-3 rounded-lg bg-[#E85D1A] text-white font-medium text-sm hover:bg-[#D14F14] active:scale-[0.98] transition-all shadow-[0_2px_8_rgba(232,93,26,0.35)] flex items-center justify-center gap-2"
            >
              <Scale size={15} />
              Upgrade Plan
            </button>
            <button
              onClick={() => router.push("/dashboard/calculator")}
              className="px-4 py-3 rounded-lg text-[#9C8C7A] font-medium text-sm hover:bg-[#F0EBE3] transition-all flex items-center justify-center gap-2"
            >
              <Calculator size={15} />
              How It Works
            </button>
          </div>
        </Card>
      </div>

      {/* ============ ROW 4 — PAYOUT HISTORY ============ */}
      <Card delay={0.3}>
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-base font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Payout History
          </h3>
          <button
            onClick={() => router.push("/dashboard/claims")}
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
            style={{ color: "#E85D1A", fontFamily: "var(--font-body)" }}
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                <th className="pb-3 pr-4 font-medium">Week</th>
                <th className="pb-3 pr-4 font-medium">Trigger</th>
                <th className="pb-3 pr-4 font-medium">Duration</th>
                <th className="pb-3 pr-4 font-medium">Payout</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map((row, i) => {
                const isClean = row.status === "Clean";
                const isCompleted = row.status === "Completed";
                const isProcessing = row.status === "Processing";

                return (
                  <tr
                    key={row.week}
                    className={i < recentPayouts.length - 1 ? "border-t border-[var(--border)]" : ""}
                    style={{
                      opacity: isClean ? 0.5 : 1,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <td className="py-3.5 pr-4 font-medium">{row.week}</td>
                    <td className="py-3.5 pr-4" style={{ color: isClean ? "var(--muted)" : "var(--foreground)" }}>
                      {row.trigger ?? "—"}
                    </td>
                    <td className="py-3.5 pr-4" style={{ color: isClean ? "var(--muted)" : "var(--foreground)", fontFamily: "var(--font-mono)" }}>
                      {row.hours > 0 ? `${row.hours} hrs` : "—"}
                    </td>
                    <td
                      className="py-3.5 pr-4 font-medium"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: isCompleted
                          ? "#16A34A"
                          : isProcessing
                            ? "#D97706"
                            : "var(--muted)",
                      }}
                    >
                      {row.payout > 0
                        ? `₹${row.payout.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="py-3.5 text-right">
                      {isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A]">
                          Completed
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
                          <Loader2 size={12} className="animate-spin" />
                          Processing
                        </span>
                      )}
                      {isClean && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--muted)]">
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
