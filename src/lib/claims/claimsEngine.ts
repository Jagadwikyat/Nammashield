import { supabaseAdmin } from "@/lib/supabase/server";
import { calculateActiveScore } from "./activeScore";
import { calculatePayout } from "./payoutCalc";

const ML_BASE = process.env.NEXT_PUBLIC_ML_API_URL?.replace(/\/$/, "") ?? "";

export type ClaimsSummary = {
  affected: number;
  total_payout: number;
  auto_approved: number;
  watchlist: number;
  flagged: number;
  rejected: number;
};

function hashFeatures(workerId: string) {
  let h = 0;
  for (let i = 0; i < workerId.length; i++)
    h = (Math.imul(31, h) + workerId.charCodeAt(i)) | 0;
  const u = Math.abs(h) / 0x7fffffff;
  return {
    claim_velocity: 0.15 + u * 0.35,
    zone_coherence_score: Math.min(1, 0.55 + u * 0.4),
    same_device_cluster: u * 0.3,
  };
}

async function callFraudScore(workerId: string): Promise<{
  fraud_score: number;
  decision: string;
}> {
  const f = hashFeatures(workerId);
  if (!ML_BASE) {
    return { fraud_score: 0.25, decision: "auto_approve" };
  }
  try {
    const res = await fetch(`${ML_BASE}/ml/fraud-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker_id: workerId,
        claim_velocity: f.claim_velocity,
        zone_coherence_score: f.zone_coherence_score,
        same_device_cluster: f.same_device_cluster,
      }),
    });
    if (!res.ok) return { fraud_score: 0.4, decision: "watchlist" };
    return (await res.json()) as { fraud_score: number; decision: string };
  } catch {
    return { fraud_score: 0.4, decision: "watchlist" };
  }
}

export async function processClaimsForTrigger(
  triggerEventId: string
): Promise<ClaimsSummary> {
  const { data: ev, error: evErr } = await supabaseAdmin
    .from("trigger_events")
    .select("*")
    .eq("id", triggerEventId)
    .single();

  if (evErr || !ev) {
    throw new Error("Trigger event not found");
  }

  const start = new Date(ev.started_at).getTime();
  const end = ev.ended_at
    ? new Date(ev.ended_at).getTime()
    : Date.now();
  const totalDisruptionHours = Math.max(
    0.25,
    (end - start) / (1000 * 60 * 60)
  );

  const { data: workers, error: wErr } = await supabaseAdmin
    .from("workers")
    .select("id, city, zone")
    .eq("city", ev.city)
    .eq("zone", ev.zone);

  if (wErr || !workers?.length) {
    return {
      affected: 0,
      total_payout: 0,
      auto_approved: 0,
      watchlist: 0,
      flagged: 0,
      rejected: 0,
    };
  }

  const workerIds = workers.map((w) => w.id);
  const { data: policies, error: pErr } = await supabaseAdmin
    .from("policies")
    .select("id, worker_id, tier, weekly_premium, risk_score")
    .in("worker_id", workerIds)
    .eq("status", "active");

  if (pErr || !policies?.length) {
    return {
      affected: 0,
      total_payout: 0,
      auto_approved: 0,
      watchlist: 0,
      flagged: 0,
      rejected: 0,
    };
  }

  let total_payout = 0;
  let auto_approved = 0;
  let watchlist = 0;
  let flagged = 0;
  let rejected = 0;

  for (const pol of policies) {
    const workerId = pol.worker_id as string;
    const worker = workers.find((w) => w.id === workerId);
    const city = (worker?.city as string) || ev.city;

    const activeScore = await calculateActiveScore(workerId, triggerEventId);
    const fraud = await callFraudScore(workerId);
    const fraudScore = fraud.fraud_score;

    const { finalPayout, coveredHours } = calculatePayout({
      totalDisruptionHours,
      city,
      tier: pol.tier as string,
      weeklyPremium: Number(pol.weekly_premium),
    });

    let status: string;
    if (activeScore < 0.35) {
      status = "rejected";
      rejected += 1;
    } else if (fraudScore < 0.3) {
      status = "auto_approved";
      auto_approved += 1;
    } else if (fraudScore <= 0.7) {
      status = "watchlist";
      watchlist += 1;
    } else {
      status = "flagged";
      flagged += 1;
    }

    const payoutAmount =
      status === "rejected" || status === "flagged" ? 0 : finalPayout;

    const { data: claimRow, error: cErr } = await supabaseAdmin
      .from("claims")
      .insert({
        worker_id: workerId,
        policy_id: pol.id,
        trigger_event_id: triggerEventId,
        active_score: activeScore,
        fraud_score: fraudScore,
        covered_hours: coveredHours,
        payout_amount: payoutAmount,
        status,
        rejection_reason:
          status === "rejected"
            ? "Active score below threshold (0.35)"
            : null,
      })
      .select("id")
      .single();

    if (cErr || !claimRow) continue;

    if (payoutAmount > 0 && (status === "auto_approved" || status === "watchlist")) {
      const { data: wBefore } = await supabaseAdmin
        .from("workers")
        .select("wallet_balance")
        .eq("id", workerId)
        .single();

      const prev = Number(wBefore?.wallet_balance ?? 0);
      const next = Math.round((prev + payoutAmount) * 100) / 100;

      await supabaseAdmin
        .from("workers")
        .update({ wallet_balance: next })
        .eq("id", workerId);

      await supabaseAdmin.from("payout_log").insert({
        claim_id: claimRow.id,
        worker_id: workerId,
        amount: payoutAmount,
        wallet_balance_after: next,
        status: "completed",
      });

      total_payout += payoutAmount;
    }
  }

  return {
    affected: policies.length,
    total_payout: Math.round(total_payout * 100) / 100,
    auto_approved,
    watchlist,
    flagged,
    rejected,
  };
}
