"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Loader2,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/authStore";
import { useDashboardState } from "@/components/namma/DashboardStateProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";

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

type TriggerIconProps = { label: string | null; size?: number };

function TriggerIcon({ label, size = 18 }: TriggerIconProps) {
  const t = (label ?? "").toLowerCase();
  if (t.includes("rain") || t.includes("flood")) {
    return <CloudRain size={size} className="text-[var(--primary)]" />;
  }
  if (t.includes("heat")) {
    return <Thermometer size={size} className="text-[#E85D1A]" />;
  }
  if (t.includes("aqi")) {
    return <Wind size={size} className="text-[#8B5CF6]" />;
  }
  return <Sun size={size} style={{ color: "var(--muted)" }} />;
}

type ClaimRow = {
  id: string;
  created_at: string;
  payout_amount: number;
  status: string;
  covered_hours: number | null;
  active_score: number | null;
  fraud_score: number | null;
  trigger_events: { event_type: string } | null;
};

export default function ClaimsPage() {
  const workerId = useAuthStore((s) => s.workerId);
  const { policy, loading: profileLoading } = useDashboardState();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<ClaimRow[]>([]);

  useEffect(() => {
    if (!workerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("claims")
        .select(
          "id, created_at, payout_amount, status, covered_hours, active_score, fraud_score, trigger_events(event_type)"
        )
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false });
      if (!cancelled && !error) {
        setClaims((data ?? []) as ClaimRow[]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  const totalEarned = claims
    .filter((c) => c.status === "auto_approved" || c.status === "watchlist")
    .reduce((s, c) => s + Number(c.payout_amount ?? 0), 0);

  const pending = claims.filter((c) => c.status === "watchlist").length;
  const paidCount = claims.filter((c) => c.status === "auto_approved").length;

  if (profileLoading || loading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="max-w-[1200px] mx-auto pb-20">
        <Card>
          <div className="text-center py-12">
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              No active policy — complete onboarding to see claims.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-[var(--primary)] font-medium text-sm"
            >
              Go to onboarding <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card delay={0.05} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">
            Total credited
          </p>
          <div className="flex items-baseline gap-1.5 text-[var(--accent)]">
            <IndianRupee size={20} className="mb-1" />
            <span
              className="text-4xl font-semibold tracking-tighter"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalEarned.toFixed(0)}
            </span>
          </div>
        </Card>

        <Card delay={0.1} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">
            In review
          </p>
          <div className="flex items-baseline gap-1.5 text-[var(--amber)]">
            <span
              className="text-4xl font-semibold tracking-tighter"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {pending}
            </span>
          </div>
        </Card>

        <Card delay={0.15} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">
            Auto-approved
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-4xl font-semibold tracking-tighter"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {paidCount}
            </span>
          </div>
        </Card>
      </div>

      <div className="flex items-baseline justify-between mb-2 px-2">
        <h3
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Claim history
        </h3>
      </div>

      {claims.length === 0 ? (
        <Card>
          <p className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
            No claims yet. When a disruption hits your zone, payouts appear here
            automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((payout, index) => {
            const isCompleted = payout.status === "auto_approved";
            const isProcessing =
              payout.status === "watchlist" || payout.status === "flagged";
            const et = payout.trigger_events?.event_type ?? null;
            const label = et?.replace(/_/g, " ") ?? "Disruption";

            return (
              <Card key={payout.id} delay={0.1 + index * 0.05} className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 flex gap-5">
                    <div className="shrink-0 flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                        style={{
                          background: isProcessing
                            ? "var(--amber-light)"
                            : "var(--secondary)",
                          border: `1px solid ${isProcessing ? "var(--amber)" : "var(--border)"}20`,
                        }}
                      >
                        <TriggerIcon label={label} size={20} />
                      </div>
                    </div>

                    <div className="flex-1 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[11px] font-mono uppercase tracking-[0.05em] text-[var(--muted)]"
                        >
                          {format(new Date(payout.created_at), "dd MMM yyyy HH:mm")}
                        </span>
                        {isProcessing && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 uppercase border border-amber-200">
                            Review
                          </span>
                        )}
                      </div>
                      <h4
                        className="text-lg font-semibold tracking-tight capitalize"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {label}
                      </h4>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                      >
                        Active score {(Number(payout.active_score ?? 0) * 100).toFixed(0)}% ·
                        Fraud {(Number(payout.fraud_score ?? 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 md:pl-8 md:border-l md:border-[var(--border)]/10 shrink-0">
                    <span className="text-[10px] font-mono text-[var(--muted)] uppercase">
                      Payout
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium">₹</span>
                      <span
                        className="text-[32px] leading-none font-semibold tracking-tighter"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: isCompleted ? "var(--foreground)" : "var(--muted)",
                        }}
                      >
                        {Number(payout.payout_amount).toFixed(1)}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-[11px] text-[var(--accent)] font-medium bg-[var(--accent-light)] px-2.5 py-1 rounded-full">
                        <Check size={12} />
                        Credited to wallet
                      </div>
                    )}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-[11px] text-[var(--amber)] font-medium bg-[var(--amber-light)] px-2.5 py-1 rounded-full">
                        <Loader2 size={12} className="animate-spin" />
                        Under review
                      </div>
                    )}
                    {payout.status === "rejected" && (
                      <div className="text-[11px] text-[var(--muted)]">Rejected</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <motion.div {...fadeUp(0.5)} className="text-center pt-10">
        <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-body)" }}>
          Parametric payouts use GPS activity and fraud checks. 2-hour deductible applies.
        </p>
      </motion.div>
    </div>
  );
}
