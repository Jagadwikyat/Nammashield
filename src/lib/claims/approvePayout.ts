import { supabaseAdmin } from "@/lib/supabase/server";
import { calculatePayout } from "./payoutCalc";

/** Recompute payout for manual approval of watchlist/flagged claims */
export async function computeApprovalPayout(claimId: string): Promise<number> {
  const { data: claim, error: cErr } = await supabaseAdmin
    .from("claims")
    .select("worker_id, policy_id, trigger_event_id")
    .eq("id", claimId)
    .single();

  if (cErr || !claim) throw new Error("Claim not found");

  const { data: policy } = await supabaseAdmin
    .from("policies")
    .select("tier, weekly_premium")
    .eq("id", claim.policy_id)
    .single();

  const { data: ev } = await supabaseAdmin
    .from("trigger_events")
    .select("started_at, ended_at")
    .eq("id", claim.trigger_event_id)
    .single();

  const { data: worker } = await supabaseAdmin
    .from("workers")
    .select("city")
    .eq("id", claim.worker_id)
    .single();

  if (!policy || !ev || !worker?.city) throw new Error("Missing relations");

  const start = new Date(ev.started_at).getTime();
  const end = ev.ended_at
    ? new Date(ev.ended_at).getTime()
    : Date.now();
  const totalDisruptionHours = Math.max(
    0.25,
    (end - start) / (1000 * 60 * 60)
  );

  const { finalPayout } = calculatePayout({
    totalDisruptionHours,
    city: worker.city,
    tier: policy.tier,
    weeklyPremium: Number(policy.weekly_premium),
  });

  return finalPayout;
}
