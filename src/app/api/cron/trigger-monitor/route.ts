import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkWeatherAndMaybeInsert } from "@/lib/triggers/weatherCheck";
import { processClaimsForTrigger } from "@/lib/claims/claimsEngine";

/**
 * Iterates distinct city+zone from workers with active policies,
 * runs weather check; on new trigger, processes claims.
 */
export async function GET() {
  const { data: policies, error } = await supabaseAdmin
    .from("policies")
    .select("worker_id")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workerIds = [...new Set((policies ?? []).map((p) => p.worker_id))];
  if (workerIds.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, results: [] });
  }

  const { data: workers, error: wErr } = await supabaseAdmin
    .from("workers")
    .select("city, zone")
    .in("id", workerIds);

  if (wErr) {
    return NextResponse.json({ error: wErr.message }, { status: 500 });
  }

  const pairs = new Map<string, { city: string; zone: string }>();
  for (const w of workers ?? []) {
    if (w.city && w.zone) {
      pairs.set(`${w.city}|${w.zone}`, { city: w.city, zone: w.zone });
    }
  }

  const results: Array<{
    city: string;
    zone: string;
    triggered: boolean;
    claim_run?: boolean;
  }> = [];

  for (const { city, zone } of pairs.values()) {
    const check = await checkWeatherAndMaybeInsert(city, zone);
    if (check.triggered && check.trigger?.id) {
      await processClaimsForTrigger(check.trigger.id as string);
      results.push({ city, zone, triggered: true, claim_run: true });
    } else {
      results.push({ city, zone, triggered: false });
    }
  }

  return NextResponse.json({ ok: true, checked: results.length, results });
}
