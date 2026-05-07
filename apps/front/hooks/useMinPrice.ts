// Stage prices are centralized in apps/backoffice/src/config/pricing.ts.
// The front keeps its own reference constants to avoid an API call at render time.
// These values match the backoffice defaults and are overridable per-stage by admins.
const STAGE_PRICES: Record<string, number> = {
  INITIATION: 680,
  PROGRESSION: 680,
  AUTONOMIE: 1200,
  DOUBLE: 1200,
};

export function useMinPrice(type: "STAGE" | "BAPTEME", subType?: string) {
  if (type === "STAGE" && subType) {
    return { minPrice: STAGE_PRICES[subType] ?? null, loading: false, error: null };
  }
  return { minPrice: null, loading: false, error: null };
}
