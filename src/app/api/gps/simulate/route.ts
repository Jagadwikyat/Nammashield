import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Seeds 12 hourly GPS pings (past 12 hours) for every worker — demo/admin use */
export async function POST() {
  const { data: workers, error } = await supabaseAdmin
    .from("workers")
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const rows: Array<{
    worker_id: string;
    lat: number;
    lng: number;
    is_active: boolean;
    logged_at: string;
  }> = [];

  for (const w of workers ?? []) {
    for (let h = 0; h < 12; h++) {
      const t = new Date(now - (h + 1) * 60 * 60 * 1000);
      rows.push({
        worker_id: w.id,
        lat: 13.03 + h * 0.001,
        lng: 80.23 + h * 0.001,
        is_active: true,
        logged_at: t.toISOString(),
      });
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ inserted: 0 });
  }

  const { error: insErr } = await supabaseAdmin.from("gps_logs").insert(rows);

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length });
}
