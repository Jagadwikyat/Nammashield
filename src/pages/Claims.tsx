"use client";

import { motion } from "framer-motion";
import {
  Check,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Loader2,
  IndianRupee,
  Bell,
  ArrowRight,
} from "lucide-react";
import { PAYOUTS, WORKER } from "@/lib/mockData";
import { CountUp } from "@/components/namma/CountUp";

/* ─── Animation Config ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
});

const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";
const cardHover =
  "hover:shadow-[0_8px_32px_rgba(28,24,20,0.12)] hover:-translate-y-0.5 transition-all duration-200";

/* ─── Shared Card ─── */
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

/* ─── Trigger Icon Map ─── */
function TriggerIcon({
  trigger,
  size = 18,
}: {
  trigger: string | null;
  size?: number;
}) {
  switch (trigger) {
    case "Heavy Rain":
      return <CloudRain size={size} className="text-[var(--primary)]" />;
    case "Extreme Heat":
      return <Thermometer size={size} className="text-[#E85D1A]" />;
    case "AQI Alert":
      return <Wind size={size} className="text-[#8B5CF6]" />;
    default:
      return <Sun size={size} style={{ color: "var(--muted)" }} />;
  }
}

/* ─── Active Disruption Alert ─── */
function ActiveAlertBanner() {
  return (
    <motion.div
      {...fadeUp(0)}
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 mb-8"
      style={{
        background: "linear-gradient(135deg, #FFF9F2 0%, #FFF4E6 100%)",
        border: "1.5px solid rgba(232, 93, 26, 0.15)",
        boxShadow: "0 4px 20px rgba(232, 93, 26, 0.08)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative shrink-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(232, 93, 26, 0.12)",
              border: "1px solid rgba(232, 93, 26, 0.2)",
            }}
          >
            <Bell size={22} className="text-[var(--primary)]" />
          </div>
          {/* Pulsing notification dot */}
          <motion.div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ background: "var(--primary)" }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4
            className="text-[17px] font-semibold flex items-center gap-2"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
          >
            Active Disruption Detected
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest bg-[var(--primary)] text-white uppercase">
              Live
            </span>
          </h4>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            AQI Alert detected in <strong className="text-[var(--foreground)]">Zone 4</strong> — your payout is being processed automatically.
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[var(--primary)]/10">
            <Loader2 size={13} className="animate-spin text-[var(--primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: "var(--font-mono)" }}>
              Processing ₹127.5
            </span>
          </div>
          <span className="text-[10px] text-[var(--muted)] font-mono uppercase">Reference: NS-2026-LIVE-4</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Payout Timeline Card ─── */
function PayoutTimelineCard({
  payout,
  index,
}: {
  payout: (typeof PAYOUTS)[0];
  index: number;
}) {
  const isCompleted = payout.status === "Completed";
  const isProcessing = payout.status === "Processing";
  
  const accentColor = isCompleted ? "var(--accent)" : isProcessing ? "var(--amber)" : "var(--border)";

  return (
    <Card delay={0.1 + index * 0.05} className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="flex-1 flex gap-5">
          <div className="shrink-0 flex flex-col items-center gap-3">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors`}
               style={{ 
                 background: isProcessing ? "var(--amber-light)" : "var(--secondary)",
                 border: `1px solid ${isProcessing ? "var(--amber)" : "var(--border)"}20` 
               }}
             >
               <TriggerIcon trigger={payout.trigger} size={20} />
             </div>
             <div className="w-0.5 flex-1 bg-[var(--border)]/30 rounded-full" />
          </div>

          <div className="flex-1 py-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[var(--muted)]">{payout.week}</span>
               {isProcessing && (
                 <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 uppercase border border-amber-200">Pending</span>
               )}
            </div>
            <h4 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              {payout.trigger || "No Disruption"}
            </h4>
            <p className="text-sm mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              {payout.hours > 0 ? `${payout.hours} hours disruption event` : "Platform remained stable this week."}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)]/10">
              <div>
                <span className="block text-[10px] font-mono text-[var(--muted)] uppercase">Covered</span>
                <span className="text-sm font-medium">{payout.coveredHours}h</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[var(--muted)] uppercase">Rate</span>
                <span className="text-sm font-medium">₹{payout.hourlyRate}/h</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[var(--muted)] uppercase">Protection</span>
                <span className="text-sm font-medium text-[var(--accent)]">{payout.protectionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Amount */}
        <div className="flex flex-col items-end gap-2 md:pl-8 md:border-l md:border-[var(--border)]/10 shrink-0">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase">Settlement</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium">₹</span>
            <span className="text-[32px] leading-none font-semibold tracking-tighter" style={{ fontFamily: "var(--font-mono)", color: isCompleted ? "var(--foreground)" : "var(--muted)" }}>
              {payout.payout.toFixed(1)}
            </span>
          </div>
          {payout.status === "Completed" ? (
             <div className="flex items-center gap-2 text-[11px] text-[var(--accent)] font-medium bg-[var(--accent-light)] px-2.5 py-1 rounded-full">
               <Check size={12} />
               Transferred to UPI
             </div>
          ) : isProcessing ? (
             <div className="flex items-center gap-2 text-[11px] text-[var(--amber)] font-medium bg-[var(--amber-light)] px-2.5 py-1 rounded-full">
               <Loader2 size={12} className="animate-spin" />
               Processing
             </div>
          ) : (
            <div className="text-[11px] text-[var(--muted)] font-medium bg-[var(--secondary)] px-2.5 py-1 rounded-full">
               No Trigger
             </div>
          )}
          {payout.ref && (
            <span className="text-[9px] font-mono text-[var(--muted)] mt-1">{payout.ref}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ─── Main Claims Page ─── */
export default function Claims() {
  const totalEarned = PAYOUTS.reduce((sum, p) => (p.status === "Completed" ? sum + p.payout : sum), 0);
  const pendingPayout = PAYOUTS.find((p) => p.status === "Processing")?.payout || 0;
  const payoutCount = PAYOUTS.filter((p) => p.status === "Completed").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      <ActiveAlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card delay={0.05} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">Total Earned</p>
          <div className="flex items-baseline gap-1.5 text-[var(--accent)]">
            <IndianRupee size={20} className="mb-1" />
            <span className="text-4xl font-semibold tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
               {totalEarned.toFixed(1)}
            </span>
          </div>
        </Card>

        <Card delay={0.1} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">Pending Transfer</p>
          <div className="flex items-baseline gap-1.5 text-[var(--amber)]">
            <IndianRupee size={20} className="mb-1" />
            <span className="text-4xl font-semibold tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
               {pendingPayout.toFixed(1)}
            </span>
          </div>
        </Card>

        <Card delay={0.15} className="flex flex-col items-center justify-center py-8">
          <p className="text-xs font-mono uppercase text-[var(--muted)] mb-2">Payout Count</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
               {payoutCount}
            </span>
            <span className="text-sm font-medium text-[var(--muted)]">weeks</span>
          </div>
        </Card>
      </div>

      <div className="flex items-baseline justify-between mb-2 px-2">
         <h3 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Payout Timeline</h3>
         <button className="text-xs font-mono text-[var(--primary)] hover:underline flex items-center gap-1">
           Request Statement <ArrowRight size={12} />
         </button>
      </div>

      <div className="space-y-4">
        {PAYOUTS.map((payout, i) => (
          <PayoutTimelineCard key={i} payout={payout} index={i} />
        ))}
      </div>

      {/* Footer Info */}
      <motion.div {...fadeUp(0.5)} className="text-center pt-10">
         <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-body)" }}>
           Settlements are processed automatically via UPI based on parametric trigger validation.
         </p>
         <p className="text-[10px] font-mono text-[var(--border)] mt-2 tracking-widest uppercase">
           Trigger Buffer: 2 Hours Deductible Applied
         </p>
      </motion.div>
    </div>
  );
}
