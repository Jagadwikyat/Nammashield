"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  Check,
  X,
  Zap,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CountUp } from "@/components/namma/CountUp";
import { ZONES } from "@/lib/mockData";
import { Skeleton } from "@/components/ui/skeleton";

const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const EVENT_TYPES = [
  { value: "heavy_rain", label: "Heavy Rain" },
  { value: "extreme_heat", label: "Extreme Heat" },
  { value: "severe_aqi", label: "Severe AQI" },
  { value: "civil_shutdown", label: "Civil Shutdown" },
  { value: "flash_flood", label: "Flash Flood" },
];

const CITIES = Object.keys(ZONES);

type Summary = {
  activeWorkers: number;
  activePolicies: number;
  weeklyPremiums: number;
  weeklyPayouts: number;
  lossRatio: number;
  recentTriggers: Array<{
    id: string;
    event_type: string;
    city: string;
    zone: string;
    severity: string;
    started_at: string;
    claim_count: number;
  }>;
  triggerFrequency: Array<{ name: string; value: number }>;
};

type QueueRow = {
  id: string;
  worker_id: string;
  payout_amount: number;
  fraud_score: number;
  active_score: number;
  status: string;
  created_at: string;
  worker?: { name: string | null; phone: string };
  trigger?: { event_type: string };
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [eventType, setEventType] = useState("heavy_rain");
  const [city, setCity] = useState("Chennai");
  const [zone, setZone] = useState("");
  const [severity, setSeverity] = useState("severe");
  const [durationHours, setDurationHours] = useState(5);

  const cityZones = city ? ZONES[city as keyof typeof ZONES] ?? [] : [];

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, qRes] = await Promise.all([
        fetch("/api/admin/summary"),
        fetch("/api/admin/queue"),
      ]);
      const sJson = await sRes.json();
      const qJson = await qRes.json();
      if (sRes.ok) setSummary(sJson as Summary);
      if (qRes.ok) setQueue(qJson.claims ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (cityZones.length && !zone) {
      setZone(cityZones[0]);
    }
  }, [city, cityZones, zone]);

  const fireSim = async () => {
    if (!zone) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/triggers/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          city,
          zone,
          severity,
          duration_hours: durationHours,
          threshold_value: 1,
        }),
      });
      const j = await res.json();
      setSimResult(j);
      if (res.ok) void loadAll();
    } catch (e) {
      setSimResult({ error: String(e) });
    } finally {
      setSimLoading(false);
    }
  };

  const seedGps = async () => {
    setGpsLoading(true);
    try {
      await fetch("/api/gps/simulate", { method: "POST" });
    } finally {
      setGpsLoading(false);
    }
  };

  const approve = async (id: string) => {
    await fetch("/api/claims/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim_id: id }),
    });
    void loadAll();
  };

  const reject = async (id: string) => {
    await fetch("/api/claims/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim_id: id, rejection_reason: "Rejected from admin queue" }),
    });
    void loadAll();
  };

  const chartData = (summary?.triggerFrequency ?? []).map((t) => ({
    name: t.name.replace(/_/g, " "),
    count: t.value,
  }));

  if (loading && !summary) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--background)", padding: "2rem 1.5rem" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="mb-8" {...fadeUp(0)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--foreground)",
                  margin: 0,
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
                Live portfolio metrics and trigger simulation
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadAll()}
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
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.05)}>
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted)" }}
              >
                Active workers
              </span>
              <Users size={18} style={{ color: "var(--primary)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 500 }}>
              <CountUp end={summary?.activeWorkers ?? 0} duration={800} />
            </span>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.1)}>
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted)" }}
              >
                Active policies
              </span>
              <IndianRupee size={18} style={{ color: "var(--accent)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 500 }}>
              <CountUp end={summary?.activePolicies ?? 0} duration={800} />
            </span>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted)" }}
              >
                Payouts (7d)
              </span>
              <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 500, color: "#D97706" }}>
              ₹<CountUp end={summary?.weeklyPayouts ?? 0} duration={800} />
            </span>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--muted)" }}
              >
                Loss ratio
              </span>
              <TrendingDown size={18} style={{ color: "var(--primary)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 500 }}>
              <CountUp end={summary?.lossRatio ?? 0} duration={800} decimals={1} />%
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.22)}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-body)" }}>
              Trigger frequency
            </h3>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.length ? chartData : [{ name: "—", count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#E85D1A" radius={[4, 4, 0, 0]} name="Triggers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.24)}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-body)" }}>
              Recent triggers
            </h3>
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
                    <th className="text-left pb-2">Type</th>
                    <th className="text-left pb-2">Zone</th>
                    <th className="text-right pb-2">Claims</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.recentTriggers ?? []).slice(0, 10).map((t) => (
                    <tr key={t.id} className="border-t border-[var(--border)]" style={{ fontFamily: "var(--font-body)" }}>
                      <td className="py-2 capitalize">{t.event_type.replace(/_/g, " ")}</td>
                      <td className="py-2 text-xs text-[var(--muted)]">
                        {t.city} · {t.zone}
                      </td>
                      <td className="py-2 text-right font-mono">{t.claim_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="bg-white rounded-xl p-6 mb-6"
          style={{ boxShadow: cardShadow }}
          {...fadeUp(0.26)}
        >
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Zap size={18} className="text-[var(--primary)]" />
            Simulate disruption
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-[var(--muted)] font-mono uppercase">Event</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                {EVENT_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-mono uppercase">City</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setZone("");
                }}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-mono uppercase">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                {cityZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-mono uppercase">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                <option value="moderate">moderate</option>
                <option value="severe">severe</option>
                <option value="extreme">extreme</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] font-mono uppercase">Duration (hours)</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={simLoading || !zone}
              onClick={() => void fireSim()}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {simLoading ? "Running…" : "Fire trigger"}
            </button>
            <button
              type="button"
              disabled={gpsLoading}
              onClick={() => void seedGps()}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium flex items-center gap-2"
              style={{ borderColor: "var(--border)" }}
            >
              <MapPin size={16} />
              {gpsLoading ? "Seeding…" : "Simulate GPS for all workers"}
            </button>
          </div>
          {simResult && (
            <pre
              className="mt-4 p-4 rounded-lg text-xs overflow-auto max-h-48"
              style={{ background: "var(--secondary)", fontFamily: "var(--font-mono)" }}
            >
              {JSON.stringify(simResult, null, 2)}
            </pre>
          )}
        </motion.div>

        <motion.div className="bg-white rounded-xl p-6" style={{ boxShadow: cardShadow }} {...fadeUp(0.28)}>
          <h3 className="text-base font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Claims review queue
          </h3>
          {queue.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No claims in watchlist or flagged.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
                    <th className="text-left pb-2">Worker</th>
                    <th className="text-left pb-2">Trigger</th>
                    <th className="text-right pb-2">Fraud</th>
                    <th className="text-right pb-2">Active</th>
                    <th className="text-right pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        {row.worker?.name ?? row.worker?.phone ?? row.worker_id.slice(0, 8)}
                      </td>
                      <td className="py-3 capitalize text-xs">
                        {row.trigger?.event_type?.replace(/_/g, " ") ?? "—"}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {(Number(row.fraud_score) * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 text-right font-mono">
                        {(Number(row.active_score) * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void approve(row.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs mr-2 bg-[#DCFCE7] text-[#16A34A]"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void reject(row.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[var(--secondary)] text-[var(--muted)]"
                        >
                          <X size={12} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
