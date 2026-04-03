import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data: claims, error } = await supabaseAdmin
      .from("claims")
      .select(
        "id, worker_id, payout_amount, fraud_score, active_score, status, created_at, trigger_event_id"
      )
      .in("status", ["watchlist", "flagged"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    const workerIds = [...new Set((claims ?? []).map((c) => c.worker_id))];
    const triggerIds = [...new Set((claims ?? []).map((c) => c.trigger_event_id))];

    const [{ data: workers }, { data: triggers }] = await Promise.all([
      workerIds.length
        ? supabaseAdmin.from("workers").select("id, name, phone").in("id", workerIds)
        : Promise.resolve({ data: [] as { id: string; name: string | null; phone: string }[] }),
      triggerIds.length
        ? supabaseAdmin
            .from("trigger_events")
            .select("id, event_type")
            .in("id", triggerIds)
        : Promise.resolve({ data: [] as { id: string; event_type: string }[] }),
    ]);

    const wMap = Object.fromEntries((workers ?? []).map((w) => [w.id, w]));
    const tMap = Object.fromEntries((triggers ?? []).map((t) => [t.id, t]));

    const rows = (claims ?? []).map((c) => ({
      ...c,
      worker: wMap[c.worker_id as string],
      trigger: tMap[c.trigger_event_id as string],
    }));

    return NextResponse.json({ claims: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
