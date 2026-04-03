import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      claim_id?: string;
      rejection_reason?: string;
    };
    const { claim_id, rejection_reason = "Rejected by reviewer" } = body;

    if (!claim_id) {
      return NextResponse.json({ error: "claim_id required" }, { status: 400 });
    }

    const { data: claim } = await supabaseAdmin
      .from("claims")
      .select("status")
      .eq("id", claim_id)
      .single();

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "watchlist" && claim.status !== "flagged") {
      return NextResponse.json(
        { error: "Claim not in review queue" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("claims")
      .update({
        status: "rejected",
        payout_amount: 0,
        rejection_reason,
      })
      .eq("id", claim_id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
