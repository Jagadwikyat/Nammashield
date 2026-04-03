import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { computeApprovalPayout } from "@/lib/claims/approvePayout";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { claim_id?: string };
    const claimId = body.claim_id;
    if (!claimId) {
      return NextResponse.json({ error: "claim_id required" }, { status: 400 });
    }

    const { data: claim, error: cErr } = await supabaseAdmin
      .from("claims")
      .select("id, worker_id, status, payout_amount")
      .eq("id", claimId)
      .single();

    if (cErr || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "watchlist" && claim.status !== "flagged") {
      return NextResponse.json(
        { error: "Claim not in review queue" },
        { status: 400 }
      );
    }

    const payoutAmount = await computeApprovalPayout(claimId);

    const { data: wBefore } = await supabaseAdmin
      .from("workers")
      .select("wallet_balance")
      .eq("id", claim.worker_id)
      .single();

    const prev = Number(wBefore?.wallet_balance ?? 0);
    const next = Math.round((prev + payoutAmount) * 100) / 100;

    const { error: uErr } = await supabaseAdmin
      .from("claims")
      .update({
        status: "auto_approved",
        payout_amount: payoutAmount,
        rejection_reason: null,
      })
      .eq("id", claimId);

    if (uErr) throw uErr;

    await supabaseAdmin
      .from("workers")
      .update({ wallet_balance: next })
      .eq("id", claim.worker_id);

    await supabaseAdmin.from("payout_log").insert({
      claim_id: claimId,
      worker_id: claim.worker_id,
      amount: payoutAmount,
      wallet_balance_after: next,
      status: "completed",
    });

    return NextResponse.json({ ok: true, payout_amount: payoutAmount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
