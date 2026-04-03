"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  FileText,
  Calculator,
  Scale,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/authStore";
import { useDashboardState } from "@/components/namma/DashboardStateProvider";
import { toast } from "@/hooks/use-toast";
import { CountUp } from "@/components/namma/CountUp";
import { RiskRing } from "@/components/namma/RiskRing";
import { SegmentBar } from "@/components/namma/SegmentBar";
import { TriggerRow } from "@/components/namma/TriggerRow";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";
const cardHover =
  "hover:shadow-[0_8px_32px_rgba(28,24,20,0.12)] hover:-translate-y-0.5 transition-all duration-200";

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

function triggerDisplay(ev: {
  event_type: string;
  severity?: string;
  started_at?: string;
}) {
  const t = ev.event_type.toLowerCase();
  let icon = "📋";
  let name = ev.event_type.replace(/_/g, " ");
  if (t.includes("rain")) {
    icon = "🌧️";
    name = "Heavy Rain";
  } else if (t.includes("heat")) {
    icon = "🌡️";
    name = "Extreme Heat";
  } else if (t.includes("aqi")) {
    icon = "💨";
    name = "AQI Alert";
  } else if (t.includes("shutdown") || t.includes("civil")) {
    icon = "🚫";
    name = "Civil Shutdown";
  } else if (t.includes("flood")) {
    icon = "🌊";
    name = "Flash Flood";
  }
  const status =
    ev.severity === "extreme"
      ? ("active" as const)
      : ev.severity === "severe"
        ? ("elevated" as const)
        : ("normal" as const);
  return {
    icon,
    name,
    current: ev.started_at
      ? format(new Date(ev.started_at), "dd MMM, HH:mm")
      : "—",
    threshold: "Parametric",
    status,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const workerId = useAuthStore((s) => s.workerId);
  const { worker, policy, loading: profileLoading, refresh } = useDashboardState();

  const [feedLoading, setFeedLoading] = useState(true);
  const [triggers, setTriggers] = useState<
    Array<{
      id: string;
      event_type: string;
      severity: string;
      started_at: string;
    }>
  >([]);
  const [recentClaims, setRecentClaims] = useState<
    Array<{
      id: string;
      created_at: string;
      payout_amount: number;
      status: string;
      trigger_events: { event_type: string } | null;
    }>
  >([]);
  const [coverageUsed, setCoverageUsed] = useState(0);

  useEffect(() => {
    if (!workerId || !worker?.city) {
      setFeedLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setFeedLoading(true);
      const [trRes, clRes] = await Promise.all([
        supabase
          .from("trigger_events")
          .select("id, event_type, severity, started_at")
          .eq("city", worker!.city!)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("claims")
          .select("id, created_at, payout_amount, status, trigger_events(event_type)")
          .eq("worker_id", workerId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (cancelled) return;

      setTriggers((trRes.data ?? []) as typeof triggers);
      setRecentClaims((clRes.data ?? []) as typeof recentClaims);

      if (policy) {
        const { data: sumRows } = await supabase
          .from("claims")
          .select("payout_amount")
          .eq("worker_id", workerId)
          .eq("policy_id", policy.id);
        const used = (sumRows ?? []).reduce(
          (s, r) => s + Number(r.payout_amount ?? 0),
          0
        );
        setCoverageUsed(used);
      } else {
        setCoverageUsed(0);
      }
      setFeedLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [workerId, worker?.city, policy?.id]);

  useEffect(() => {
    if (!workerId) return;
    const ch = supabase
      .channel(`claims-toast-${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "claims",
          filter: `worker_id=eq.${workerId}`,
        },
        async (payload) => {
          const row = payload.new as {
            status: string;
            payout_amount: number;
            trigger_event_id: string;
          };
          if (row.status !== "auto_approved" || Number(row.payout_amount) <= 0) return;
          const { data: te } = await supabase
            .from("trigger_events")
            .select("event_type")
            .eq("id", row.trigger_event_id)
            .maybeSingle();
          const label = (te?.event_type ?? "Disruption").replace(/_/g, " ");
          toast({
            title: `₹${Number(row.payout_amount).toLocaleString("en-IN")} credited`,
            description: `${label} detected in your zone.`,
          });
          void refresh();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [workerId, refresh]);

  const displayName = worker?.name?.trim() || worker?.phone || "Partner";
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const riskScore = policy ? Math.round(Number(policy.risk_score)) : 0;
  const maxCoverage = policy ? Number(policy.coverage_amount) : 0;
  const premium = policy ? Number(policy.weekly_premium) : 0;
  const streak = worker?.streak_weeks ?? 0;

  const coverageUsedPct =
    maxCoverage > 0 ? Math.min(100, Math.round((coverageUsed / maxCoverage) * 100)) : 0;
  const coverageSegments = Math.round((coverageUsedPct / 100) * 20);
  const remaining = Math.max(0, maxCoverage - coverageUsed);

  const tierLabel = policy?.tier ?? "—";
  const riskBand =
    riskScore < 35 ? "Low Risk" : riskScore < 70 ? "Standard Risk" : "High Risk";

  const tableRows = recentClaims.slice(0, 3);

  if (profileLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <Card>
          <div className="text-center py-10 px-4">
            <h2
              className="text-xl mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No active policy
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Complete onboarding to activate coverage and see your live dashboard.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium"
              style={{ background: "var(--primary)" }}
            >
              Go to onboarding
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="text-[28px] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {greeting}, {displayName.split(" ")[0]}.
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
                ₹{maxCoverage.toLocaleString("en-IN")} max this week
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield size={64} color="#E85D1A" strokeWidth={1.6} />
            </motion.div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card delay={0.05}>
          <div className="flex items-center gap-5">
            <div className="relative">
              <RiskRing score={riskScore} size={84} strokeWidth={6} showLabel={false} />
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
                  {riskScore}/100
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
              <p className="text-sm font-medium" style={{ color: "#E85D1A" }}>
                {tierLabel} · {riskBand}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {worker?.city} — {worker?.zone}
              </p>
            </div>
          </div>
        </Card>

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
              <CountUp prefix="₹" end={premium} />
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
              🔥 {streak} week streak
            </span>
          </div>
        </Card>

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
              <CountUp end={remaining} />
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-[6px] rounded-full w-full bg-[var(--border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#16A34A]"
                initial={{ width: 0 }}
                animate={{ width: `${coverageUsedPct}%` }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {worker?.city} metro
            </p>
          </div>
          {feedLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : triggers.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--muted)" }}>
              No recent triggers in your city.
            </p>
          ) : (
            <div className="space-y-1">
              {triggers.map((t) => {
                const d = triggerDisplay(t);
                return (
                  <TriggerRow
                    key={t.id}
                    icon={d.icon}
                    name={d.name}
                    current={d.current}
                    threshold={d.threshold}
                    status={d.status}
                  />
                );
              })}
            </div>
          )}
        </Card>

        <Card delay={0.25}>
          <h3
            className="text-base font-medium mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/policy")}
              className="px-4 py-3 rounded-lg border border-[#E2D9CF] bg-[#F0EBE3] text-[#1C1814] font-medium text-sm hover:bg-[#E2D9CF] transition-all flex items-center justify-center gap-2"
            >
              <FileText size={15} />
              View Policy
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/claims")}
              className="px-4 py-3 rounded-lg border border-[#E2D9CF] bg-[#F0EBE3] text-[#1C1814] font-medium text-sm hover:bg-[#E2D9CF] transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={15} />
              Payout History
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/policy")}
              className="px-4 py-3 rounded-lg bg-[#E85D1A] text-white font-medium text-sm hover:bg-[#D14F14] active:scale-[0.98] transition-all shadow-[0_2px_8_rgba(232,93,26,0.35)] flex items-center justify-center gap-2"
            >
              <Scale size={15} />
              Upgrade Plan
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/calculator")}
              className="px-4 py-3 rounded-lg text-[#9C8C7A] font-medium text-sm hover:bg-[#F0EBE3] transition-all flex items-center justify-center gap-2"
            >
              <Calculator size={15} />
              How It Works
            </button>
          </div>
        </Card>
      </div>

      <Card delay={0.3}>
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-base font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recent claims
          </h3>
          <button
            type="button"
            onClick={() => router.push("/dashboard/claims")}
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
            style={{ color: "#E85D1A", fontFamily: "var(--font-body)" }}
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {feedLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : tableRows.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
              No claims yet — you&apos;re all clear this week.
            </p>
          ) : (
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
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Trigger</th>
                  <th className="pb-3 pr-4 font-medium">Payout</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => {
                  const et = row.trigger_events?.event_type?.replace(/_/g, " ") ?? "—";
                  const st = row.status;
                  return (
                    <tr
                      key={row.id}
                      className={i < tableRows.length - 1 ? "border-t border-[var(--border)]" : ""}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <td className="py-3.5 pr-4 font-medium">
                        {format(new Date(row.created_at), "dd MMM yyyy")}
                      </td>
                      <td className="py-3.5 pr-4 capitalize">{et}</td>
                      <td
                        className="py-3.5 pr-4 font-medium"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color:
                            Number(row.payout_amount) > 0 ? "#16A34A" : "var(--muted)",
                        }}
                      >
                        {Number(row.payout_amount) > 0
                          ? `₹${Number(row.payout_amount).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="py-3.5 text-right">
                        {st === "auto_approved" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#16A34A]">
                            Paid
                          </span>
                        )}
                        {st === "watchlist" && (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706]">
                            Review
                          </span>
                        )}
                        {st === "flagged" && (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                            Flagged
                          </span>
                        )}
                        {st === "rejected" && (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--muted)]">
                            Rejected
                          </span>
                        )}
                        {!["auto_approved", "watchlist", "flagged", "rejected"].includes(
                          st
                        ) && (
                          <span className="text-xs text-[var(--muted)]">{st}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
