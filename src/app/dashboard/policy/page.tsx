"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, ArrowRight, Shield } from "lucide-react";
import { PLANS } from "@/lib/mockData";
import { useDashboardState } from "@/components/namma/DashboardStateProvider";
import { RiskRing } from "@/components/namma/RiskRing";
import { CountUp } from "@/components/namma/CountUp";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/* ─── Shared Styles ─── */
const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  {
    question: "What's included in Pro?",
    answer:
      "Higher coverage limits, priority payout processing, and access to all trigger types including civil shutdowns.",
  },
  {
    question: "Can I downgrade later?",
    answer:
      "Yes, you can switch plans at the start of any new coverage week.",
  },
  {
    question: "How does streak discount work?",
    answer:
      "Maintain 4+ consecutive clean weeks (no payouts) for a 10% discount on your premium.",
  },
];

/* ─── Plan Table Row ─── */
function PlanRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: (string | boolean)[];
  highlight?: number;
}) {
  return (
    <tr
      className="border-b last:border-b-0 transition-colors"
      style={{ borderColor: "var(--border)" }}
    >
      <td
        className="py-3 px-4 text-sm"
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "0.8125rem",
        }}
      >
        {label}
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className="py-3 px-4 text-center"
          style={{
            background: i === highlight ? "#FDE8DA" : "transparent",
            fontFamily:
              typeof val === "string" && val.startsWith("₹")
                ? "var(--font-mono)"
                : "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: i === highlight ? 600 : 400,
            color:
              i === highlight
                ? "var(--primary)"
                : "var(--foreground)",
          }}
        >
          {typeof val === "boolean" ? (
            val ? (
              <Check
                size={16}
                className="inline-block"
                style={{ color: "var(--accent)" }}
              />
            ) : (
              <X
                size={16}
                className="inline-block"
                style={{ color: "var(--border)" }}
              />
            )
          ) : (
            val
          )}
        </td>
      ))}
    </tr>
  );
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        borderColor: "var(--border)",
        background: "white",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "0.875rem",
          color: "var(--foreground)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span>{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={16}
            style={{ color: "var(--muted)", flexShrink: 0 }}
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-3 text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                fontSize: "0.8125rem",
              }}
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Left Column: Active Policy Card ─── */
function ActivePolicyCard() {
  const [autoRenew, setAutoRenew] = useState(true);
  const { worker, policy, loading } = useDashboardState();

  if (loading) {
    return (
      <div
        className="bg-white rounded-xl p-6 h-fit sticky top-6"
        style={{ boxShadow: cardShadow }}
      >
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!worker || !policy) {
    return (
      <div
        className="bg-white rounded-xl p-6 h-fit sticky top-6"
        style={{ boxShadow: cardShadow }}
      >
        <h2
          className="text-lg mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No active policy
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Complete onboarding to view and manage your coverage.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: "var(--primary)" }}
        >
          Complete onboarding
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const riskScore = Math.round(Number(policy.risk_score));
  const startLabel = policy.start_date
    ? format(new Date(policy.start_date), "MMM d, yyyy")
    : "—";
  const endLabel = policy.end_date
    ? format(new Date(policy.end_date), "MMM d, yyyy")
    : "—";

  return (
    <div
      className="bg-white rounded-xl p-6 h-fit sticky top-6"
      style={{ boxShadow: cardShadow }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-xs font-medium mb-1"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current Plan
          </p>
          <h2
            className="text-2xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--foreground)",
            }}
          >
            {policy.tier}
          </h2>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: "#FDE8DA",
            color: "#E85D1A",
            fontFamily: "var(--font-body)",
          }}
        >
          {policy.tier}
        </span>
      </div>

      {/* Premium */}
      <div className="mb-6">
        <p
          className="text-xs font-medium mb-1"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Weekly Premium
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="font-medium"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "2.25rem",
              fontWeight: 500,
              color: "#E85D1A",
              lineHeight: 1.1,
            }}
          >
            <CountUp prefix="₹" end={Number(policy.weekly_premium)} />
          </span>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--muted)",
            }}
          >
            / week
          </span>
        </div>
      </div>

      {/* Coverage & Window */}
      <div className="rounded-lg p-4 mb-5" style={{ background: "var(--secondary)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p
              className="text-xs font-medium mb-0.5"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Max Coverage
            </p>
            <p
              className="font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.125rem",
                color: "var(--foreground)",
              }}
            >
              <CountUp prefix="₹" end={Number(policy.coverage_amount)} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                }}
              >
                {" "}
                max per week
              </span>
            </p>
          </div>
          <Shield size={18} style={{ color: "var(--muted)" }} />
        </div>
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--muted)",
            fontSize: "0.75rem",
          }}
        >
          {startLabel} — {endLabel}
        </p>
      </div>

      {/* Risk Score */}
      <div className="mb-5">
        <p
          className="text-xs font-medium mb-3"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Risk Score
        </p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <RiskRing score={riskScore} size={56} strokeWidth={5} showLabel={false} />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ marginTop: 0 }}
            >
              <span
                className="font-medium"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  color: "var(--foreground)",
                }}
              >
                {riskScore}
              </span>
            </div>
          </div>
          <div>
            <p
              className="font-medium text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--foreground)",
              }}
            >
              {riskScore} / 100
            </p>
            <p
              className="text-xs"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
              }}
            >
              {riskScore < 35
                ? "Low Risk"
                : riskScore < 70
                  ? "Standard Risk"
                  : "High Risk"}
            </p>
          </div>
        </div>
      </div>

      {/* Deductible */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4"
        style={{
          background: "var(--amber-light)",
          borderLeft: "3px solid var(--amber)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 28,
            height: 28,
            background: "var(--amber)",
          }}
        >
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-body)",
            color: "#92400E",
          }}
        >
          <strong>Deductible:</strong> First 2 hours not covered
        </p>
      </div>

      {/* Streak */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
        style={{
          background: "var(--accent-light)",
          borderLeft: "3px solid var(--accent)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 28,
            height: 28,
            background: "var(--accent)",
          }}
        >
          <span className="text-white text-xs">🔥</span>
        </div>
        <div>
          <p
            className="text-xs font-medium"
            style={{
              fontFamily: "var(--font-body)",
              color: "#166534",
            }}
          >
            {worker.streak_weeks ?? 0} weeks clean
          </p>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#166534",
              fontSize: "0.6875rem",
            }}
          >
            10% discount at week 4
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mb-4"
        style={{
          borderTop: "1px solid var(--border)",
        }}
      />

      {/* Auto-renew toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--foreground)",
            }}
          >
            Auto-renew
          </p>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
            }}
          >
            {autoRenew ? "Enabled" : "Disabled"}
          </p>
        </div>
        <Switch
          checked={autoRenew}
          onCheckedChange={setAutoRenew}
        />
      </div>

      {/* Next debit */}
      <div
        className="rounded-lg p-3"
        style={{ background: "var(--secondary)" }}
      >
        <p
          className="text-xs font-medium mb-0.5"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Next Debit
        </p>
        <p
          className="font-medium text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--foreground)",
          }}
        >
          ₹{Number(policy.weekly_premium)} — renews {endLabel}
        </p>
      </div>
    </div>
  );
}

/* ─── Right Column: Plan Comparison ─── */
function PlanComparison() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { policy } = useDashboardState();
  const tierIdx = PLANS.findIndex((p) => p.name === policy?.tier);
  const activeIndex = tierIdx >= 0 ? tierIdx : 0;

  return (
    <div>
      {/* Plan Comparison Table */}
      <div
        className="bg-white rounded-xl overflow-hidden mb-6"
        style={{ boxShadow: cardShadow }}
      >
        <div className="px-6 pt-6 pb-4">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.375rem",
              color: "var(--foreground)",
              marginBottom: "0.25rem",
            }}
          >
            Compare Plans
          </h3>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
            }}
          >
            Choose the coverage that fits your work schedule
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            {/* Header */}
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th
                  className="py-3 px-4 text-left text-xs font-medium"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: "30%",
                  }}
                >
                  Feature
                </th>
                {PLANS.map((plan, i) => (
                  <th
                    key={plan.name}
                    className="py-3 px-4 text-center text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-body)",
                      color:
                        i === activeIndex
                          ? "var(--primary)"
                          : "var(--foreground)",
                      background: i === activeIndex ? "#FDE8DA" : "transparent",
                      borderTop:
                        i === activeIndex
                          ? "3px solid #E85D1A"
                          : "3px solid transparent",
                      position: "relative",
                      minWidth: "17.5%",
                    }}
                  >
                    {plan.name}
                    {i === activeIndex && (
                      <span
                        className="block mt-0.5"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.625rem",
                          fontWeight: 400,
                          color: "var(--primary)",
                          opacity: 0.8,
                        }}
                      >
                        CURRENT
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <PlanRow
                label="Weekly Premium"
                values={PLANS.map((p) => `₹${p.premium}`)}
                highlight={activeIndex}
              />
              <PlanRow
                label="Max Weekly Coverage"
                values={PLANS.map((p) => `₹${p.maxCoverage.toLocaleString("en-IN")}`)}
                highlight={activeIndex}
              />
              <PlanRow
                label="Risk Score Range"
                values={PLANS.map((p) => p.riskRange)}
                highlight={activeIndex}
              />
              <PlanRow
                label="Streak Discount"
                values={PLANS.map((p) => p.streakDiscount)}
                highlight={activeIndex}
              />
              <PlanRow
                label="Recommended for"
                values={PLANS.map((p) => p.recommended)}
                highlight={activeIndex}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Button */}
      <motion.button
        className="w-full py-3.5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 mb-6 cursor-pointer"
        style={{
          background: "var(--primary)",
          boxShadow: "0 2px 12px rgba(232, 93, 26, 0.35)",
          fontFamily: "var(--font-body)",
          border: "none",
        }}
        whileHover={{ scale: 1.01, boxShadow: "0 4px 16px rgba(232, 93, 26, 0.45)" }}
        whileTap={{ scale: 0.99 }}
      >
        Upgrade to Pro
        <ArrowRight size={16} />
      </motion.button>

      {/* FAQ Section */}
      <div>
        <h4
          className="text-sm font-semibold mb-3"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--foreground)",
          }}
        >
          Why upgrade?
        </h4>
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Policy Page ─── */
export default function PolicyPage() {
  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column — Active Policy (40%) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ActivePolicyCard />
        </motion.div>

        {/* Right Column — Plan Comparison (60%) */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.08,
          }}
        >
          <PlanComparison />
        </motion.div>
      </div>
    </div>
  );
}
