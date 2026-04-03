import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Ratio of GPS pings during the trigger window vs expected (1 ping/hour).
 * Demo fallback 0.65 when no logs.
 */
export async function calculateActiveScore(
  workerId: string,
  triggerEventId: string
): Promise<number> {
  const { data: trigger, error: tErr } = await supabaseAdmin
    .from("trigger_events")
    .select("started_at, ended_at")
    .eq("id", triggerEventId)
    .single();

  if (tErr || !trigger) return 0.65;

  const start = new Date(trigger.started_at).getTime();
  const end = trigger.ended_at
    ? new Date(trigger.ended_at).getTime()
    : Date.now();
  const durationHours = Math.max(
    0.25,
    (end - start) / (1000 * 60 * 60)
  );

  const { data: logs, error: lErr } = await supabaseAdmin
    .from("gps_logs")
    .select("id")
    .eq("worker_id", workerId)
    .gte("logged_at", new Date(start).toISOString())
    .lte("logged_at", new Date(end).toISOString());

  if (lErr || !logs?.length) return 0.65;

  const expectedPings = Math.max(1, Math.floor(durationHours));
  const activePings = logs.length;
  return Math.min(1, activePings / expectedPings);
}
