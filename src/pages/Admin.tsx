"use client";

import { motion } from "framer-motion";
import {
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  Eye,
  Check,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ADMIN_KPI,
  WEEKLY_DATA,
  TRIGGER_FREQUENCY,
  LIVE_TRIGGERS,
  FRAUD_QUEUE,
} from "@/lib/mockData";
import { CountUp } from "@/components/namma/CountUp";

/* ─── Animation Config ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Card Shadow ─── */
const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";

/* ─── Pulsing Dot for Active Status ─── */
function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: color }}
      />
    </span>
  );
}

/* ─── Custom Bar Chart Tooltip ─── */
function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length < 2) return null;
  const premium = payload.find((p) => p.name === "Premiums")?.value ?? 0;
  const payouts = payload.find((p) => p.name === "Payouts")?.value ?? 0;
  const lossRatio = premium > 0 ? ((payouts / premium) * 100).toFixed(1) : "0.0";

  return (
    <div
      className="rounded-lg p-3 text-sm"
      style={{
        background: "var(--foreground)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <p
        className="mb-2 font-medium"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {label}
      </p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm inline-block"
            style={{ background: "#E85D1A" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "white",
            }}
          >
            Premiums: ₹{(premium / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm inline-block"
            style={{ background: "#16A34A" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "white",
            }}
          >
            Payouts: ₹{(payouts / 1000).toFixed(0)}K
          </span>
        </div>
        <div
          className="mt-1 pt-1"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Loss Ratio:{" "}
            <span style={{ color: "white" }}>{lossRatio}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Custom Pie Tooltip ─── */
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; fill: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const total = TRIGGER_FREQUENCY.reduce((s, d) => s + d.value, 0);
  const pct = ((data.value / total) * 100).toFixed(1);

  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: "var(--foreground)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full inline-block"
          style={{ background: data.fill }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "white",
            fontWeight: 500,
          }}
        >
          {data.name}
        </span>
      </div>
      <div className="mt-1 ml-[18px]">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {data.value} triggers ({pct}%)
        </span>
      </div>
    </div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function Admin() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--background)", padding: "2rem 1.5rem" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" {...fadeUp(0)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--foreground)",
                  margin: 0,
                  letterSpacing: "-0.025em",
                }}
              >
                Admin Dashboard
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  color: "var(--muted)",
                  marginTop: "0.25rem",
                }}
              >
                NammaShield insurer overview
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: "var(--font-body)",
                background: "white",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                boxShadow: cardShadow,
              }}
            >
              <RefreshCw size={14} style={{ color: "var(--muted)" }} />
              Refresh Data
            </button>
          </div>
        </motion.div>

        {/* ─── Row 1: KPI Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Enrolled Workers */}
          <motion.div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.05)}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  color: "var(--muted)",
                  letterSpacing: "0.05em",
                }}
              >
                Total Enrolled Workers
              </span>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--primary-light)",
                }}
              >
                <Users size={18} style={{ color: "var(--primary)" }} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                <CountUp end={ADMIN_KPI.enrolled} duration={1400} />
              </span>
            </div>
            <span
              className="inline-flex items-center gap-1 mt-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--accent)",
              }}
            >
              +{ADMIN_KPI.enrolledDelta} this week
            </span>
          </motion.div>

          {/* Card 2: Premiums Collected */}
          <motion.div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.1)}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  color: "var(--muted)",
                  letterSpacing: "0.05em",
                }}
              >
                Premiums Collected (This Week)
              </span>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--accent-light)",
                }}
              >
                <IndianRupee size={18} style={{ color: "var(--accent)" }} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                ₹
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                <CountUp end={ADMIN_KPI.premiums} duration={1400} />
              </span>
            </div>
          </motion.div>

          {/* Card 3: Payouts Disbursed */}
          <motion.div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.15)}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  color: "var(--muted)",
                  letterSpacing: "0.05em",
                }}
              >
                Payouts Disbursed (This Week)
              </span>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--amber-light)",
                }}
              >
                <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "#D97706",
                  lineHeight: 1,
                }}
              >
                ₹
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "#D97706",
                  lineHeight: 1,
                }}
              >
                <CountUp end={ADMIN_KPI.payouts} duration={1400} />
              </span>
            </div>
          </motion.div>

          {/* Card 4: Loss Ratio */}
          <motion.div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.2)}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  color: "var(--muted)",
                  letterSpacing: "0.05em",
                }}
              >
                Current Loss Ratio
              </span>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--primary-light)",
                }}
              >
                <TrendingDown size={18} style={{ color: "var(--primary)" }} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                <CountUp end={ADMIN_KPI.lossRatio} duration={1400} decimals={1} />
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.25rem",
                  color: "var(--muted)",
                }}
              >
                %
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  fontWeight: 500,
                }}
              >
                Healthy
              </span>
            </div>
            {/* Mini progress bar */}
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--secondary)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "var(--accent)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${ADMIN_KPI.lossRatio}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </div>

        {/* ─── Row 2: Charts ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Left: Bar Chart (60%) */}
          <motion.div
            className="lg:col-span-3 bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.25)}
          >
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: "0.25rem",
              }}
            >
              Weekly Payout vs Premium
            </h3>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginBottom: "1rem",
              }}
            >
              Last 8 weeks
            </p>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={WEEKLY_DATA}
                  barGap={4}
                  margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fill: "var(--muted)",
                    }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fill: "var(--muted)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
                  <Bar
                    dataKey="premiums"
                    name="Premiums"
                    fill="#E85D1A"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="payouts"
                    name="Payouts"
                    fill="#16A34A"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm inline-block"
                  style={{ background: "#E85D1A" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                  }}
                >
                  Premiums
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm inline-block"
                  style={{ background: "#16A34A" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                  }}
                >
                  Payouts
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Donut Chart (40%) */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-xl p-6"
            style={{ boxShadow: cardShadow }}
            {...fadeUp(0.3)}
          >
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: "0.25rem",
              }}
            >
              Trigger Frequency
            </h3>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginBottom: "1rem",
              }}
            >
              Distribution by type
            </p>
            <div className="relative" style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TRIGGER_FREQUENCY}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {TRIGGER_FREQUENCY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label Overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--muted)",
                    fontWeight: 500,
                  }}
                >
                  4 trigger types
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 mt-4">
              {TRIGGER_FREQUENCY.map((item) => {
                const total = TRIGGER_FREQUENCY.reduce((s, d) => s + d.value, 0);
                const pct = ((item.value / total) * 100).toFixed(0);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full inline-block"
                        style={{ background: item.fill }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8125rem",
                          color: "var(--foreground)",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--muted)",
                        }}
                      >
                        {pct}%
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--foreground)",
                          background: "var(--secondary)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ─── Row 3: Live Trigger Monitor ─── */}
        <motion.div
          className="bg-white rounded-xl p-6 mb-6"
          style={{ boxShadow: cardShadow }}
          {...fadeUp(0.35)}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                Live Trigger Monitor
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "0.125rem",
                }}
              >
                Active weather &amp; disruption alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                <PulsingDot color="#D97706" />
                Live
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Trigger", "City", "Zone", "Workers Affected", "Status", "Time Since Trigger"].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left pb-3"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--muted)",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {LIVE_TRIGGERS.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors duration-150"
                    style={{
                      borderTop: "1px solid var(--border)",
                      background:
                        row.status === "active"
                          ? "rgba(217, 119, 6, 0.03)"
                          : "transparent",
                    }}
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          size={14}
                          style={{
                            color:
                              row.status === "active"
                                ? "#D97706"
                                : "var(--muted)",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "var(--foreground)",
                          }}
                        >
                          {row.trigger}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          color: "var(--foreground)",
                        }}
                      >
                        {row.city}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8125rem",
                          color: "var(--muted)",
                        }}
                      >
                        {row.zone}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--foreground)",
                        }}
                      >
                        {row.workers}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      {row.status === "active" ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            background: "var(--amber-light)",
                            color: "var(--amber)",
                          }}
                        >
                          <PulsingDot color="#D97706" />
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            background: "var(--secondary)",
                            color: "var(--muted)",
                          }}
                        >
                          <Eye size={10} />
                          Monitoring
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8125rem",
                          color: "var(--muted)",
                        }}
                      >
                        {row.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {LIVE_TRIGGERS.map((row, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{
                  border: "1px solid var(--border)",
                  background:
                    row.status === "active"
                      ? "rgba(217, 119, 6, 0.03)"
                      : "white",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      style={{
                        color:
                          row.status === "active"
                            ? "#D97706"
                            : "var(--muted)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {row.trigger}
                    </span>
                  </div>
                  {row.status === "active" ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        background: "var(--amber-light)",
                        color: "var(--amber)",
                      }}
                    >
                      <PulsingDot color="#D97706" />
                      Active
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        background: "var(--secondary)",
                        color: "var(--muted)",
                      }}
                    >
                      Monitoring
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
                  <span>{row.city} · {row.zone}</span>
                  <span>{row.workers} workers</span>
                  <span>{row.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Row 4: Fraud Queue ─── */}
        <motion.div
          className="bg-white rounded-xl p-6"
          style={{ boxShadow: cardShadow }}
          {...fadeUp(0.4)}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                Fraud Queue
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "0.125rem",
                }}
              >
                Suspicious claims requiring review
              </p>
            </div>
            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                background: "var(--secondary)",
                color: "var(--muted)",
              }}
            >
              {FRAUD_QUEUE.length} items
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Worker ID", "Name", "Fraud Score", "Flag Reason", "Zone", "Action"].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left pb-3"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--muted)",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {FRAUD_QUEUE.map((row, i) => {
                  const scoreColor =
                    row.fraudScore > 0.7
                      ? { bg: "#FEE2E2", text: "#DC2626", border: "#DC2626" }
                      : row.fraudScore >= 0.3
                        ? { bg: "#FEF3C7", text: "#D97706", border: "#D97706" }
                        : { bg: "#DCFCE7", text: "#16A34A", border: "#16A34A" };

                  return (
                    <tr
                      key={i}
                      className="transition-colors duration-150"
                      style={{
                        borderTop: "1px solid var(--border)",
                        borderLeft:
                          row.fraudScore > 0.7
                            ? "4px solid #DC2626"
                            : "4px solid transparent",
                      }}
                    >
                      <td className="py-3.5 pr-4" style={{ paddingLeft: row.fraudScore > 0.7 ? "12px" : "16px" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          {row.id}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "var(--foreground)",
                          }}
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: scoreColor.bg,
                            color: scoreColor.text,
                          }}
                        >
                          {(row.fraudScore * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.8125rem",
                            color: "var(--foreground)",
                            maxWidth: 220,
                            display: "inline-block",
                          }}
                        >
                          {row.reason}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          {row.zone}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                            style={{
                              fontFamily: "var(--font-body)",
                              background: "transparent",
                              color: "var(--accent)",
                              border: "1px solid var(--accent)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--accent-light)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                            style={{
                              fontFamily: "var(--font-body)",
                              background: "transparent",
                              color: "var(--amber)",
                              border: "1px solid var(--amber)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--amber-light)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Eye size={12} />
                            Review
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                            style={{
                              fontFamily: "var(--font-body)",
                              background: "transparent",
                              color: "#DC2626",
                              border: "1px solid #DC2626",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#FEE2E2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {FRAUD_QUEUE.map((row, i) => {
              const scoreColor =
                row.fraudScore > 0.7
                  ? { bg: "#FEE2E2", text: "#DC2626" }
                  : row.fraudScore >= 0.3
                    ? { bg: "#FEF3C7", text: "#D97706" }
                    : { bg: "#DCFCE7", text: "#16A34A" };

              return (
                <div
                  key={i}
                  className="rounded-lg p-4"
                  style={{
                    border: "1px solid var(--border)",
                    borderLeft:
                      row.fraudScore > 0.7
                        ? "4px solid #DC2626"
                        : "4px solid transparent",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--foreground)",
                        }}
                      >
                        {row.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--muted)",
                          marginLeft: 8,
                        }}
                      >
                        {row.id}
                      </span>
                    </div>
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        background: scoreColor.bg,
                        color: scoreColor.text,
                      }}
                    >
                      {(row.fraudScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8125rem",
                      color: "var(--muted)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {row.reason}
                  </p>
                  <div
                    className="flex items-center justify-between"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                    }}
                  >
                    <span>{row.zone}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                        style={{
                          fontFamily: "var(--font-body)",
                          background: "transparent",
                          color: "var(--accent)",
                          border: "1px solid var(--accent)",
                        }}
                      >
                        <Check size={10} />
                        Approve
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                        style={{
                          fontFamily: "var(--font-body)",
                          background: "transparent",
                          color: "var(--amber)",
                          border: "1px solid var(--amber)",
                        }}
                      >
                        <Eye size={10} />
                        Review
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                        style={{
                          fontFamily: "var(--font-body)",
                          background: "transparent",
                          color: "#DC2626",
                          border: "1px solid #DC2626",
                        }}
                      >
                        <X size={10} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
