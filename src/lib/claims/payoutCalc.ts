/** City income band midpoints (₹/month) — NammaShield Phase 2 spec */
export const CITY_INCOME_BANDS: Record<string, number> = {
  Chennai: 3400,
  Mumbai: 4000,
  Delhi: 3700,
  Bengaluru: 4400,
};

export type PayoutInput = {
  /** Total disruption window in hours (before deductible) */
  totalDisruptionHours: number;
  city: string;
  tier: string;
  weeklyPremium: number;
};

/**
 * covered_hours = total_disruption_hours - 2 (2h deductible)
 * hourly_rate = city_income_midpoint / 56
 * raw_payout = covered_hours × hourly_rate × 0.70
 * final = min(raw_payout, 1.5 × weekly_premium)
 */
export function calculatePayout(input: PayoutInput): {
  coveredHours: number;
  hourlyRate: number;
  rawPayout: number;
  finalPayout: number;
} {
  const midpoint =
    CITY_INCOME_BANDS[input.city] ?? CITY_INCOME_BANDS.Chennai;
  const hourlyRate = midpoint / 56;
  const coveredHours = Math.max(0, input.totalDisruptionHours - 2);
  const rawPayout = coveredHours * hourlyRate * 0.7;
  const cap = 1.5 * input.weeklyPremium;
  const finalPayout = Math.min(rawPayout, cap);
  return {
    coveredHours,
    hourlyRate,
    rawPayout,
    finalPayout: Math.round(finalPayout * 100) / 100,
  };
}
