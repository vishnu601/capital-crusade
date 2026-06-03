import type { Asset } from "@/types/game";

// =============================================================================
// Asset catalogue — 6 stylized Indian-flavoured funds across all 4 asset classes.
//
// Naming rule: "Bharath" = large/institutional, "Lotus" = boutique/niche.
// These are not real AMCs or funds. buriedFact is the trap the debrief reveals.
// =============================================================================

export const ASSETS: Asset[] = [
  // ── EQUITY ────────────────────────────────────────────────────────────────

  {
    id: "bharath_largecap_eq",
    name: "Bharath Large-Cap Equity Fund",
    class: "equity",
    expenseRatio: 0.012, // 1.2%
    exitLoadPct: 0,
    exitLoadPeriodDays: 0,
    description:
      "Invests in the top 100 companies by market cap. Stable, slow, dependable. " +
      "Historical 10-yr CAGR around 12%.",
    buriedFact:
      "No exit load — but STCG of 20% applies if sold within 1 year.",
  },

  {
    id: "bharath_smallcap_eq",
    name: "Bharath Small-Cap Equity Fund",
    class: "equity",
    expenseRatio: 0.0185, // 1.85%
    exitLoadPct: 0.01,    // 1%
    exitLoadPeriodDays: 365,
    description:
      "Aggressive small-cap fund. High return potential, brutal drawdowns of " +
      "40–60% in corrections.",
    buriedFact:
      "1% exit load if redeemed within 1 year, plus STCG.",
  },

  {
    id: "lotus_elss_tax",
    name: "Lotus ELSS Tax Saver Fund",
    class: "equity",
    expenseRatio: 0.015, // 1.5%
    exitLoadPct: 0,
    exitLoadPeriodDays: 0,
    description:
      "Tax-saving equity fund. Diversified across market caps.",
    buriedFact:
      "MANDATORY 3-YEAR LOCK-IN. Cannot be sold before 1095 days, no matter what.",
  },

  // ── DEBT ──────────────────────────────────────────────────────────────────

  {
    id: "bharath_corp_debt",
    name: "Bharath Corporate Bond Fund",
    class: "debt",
    expenseRatio: 0.006, // 0.6%
    exitLoadPct: 0,
    exitLoadPeriodDays: 0,
    description:
      "Investment-grade corporate bonds. Low volatility, modest returns 6–8%.",
    buriedFact:
      "Highly sensitive to interest rate changes — NAV drops when rates rise.",
  },

  // ── GOLD ──────────────────────────────────────────────────────────────────

  {
    id: "lotus_gold_etf",
    name: "Lotus Gold ETF",
    class: "gold",
    expenseRatio: 0.005, // 0.5%
    exitLoadPct: 0,
    exitLoadPeriodDays: 0,
    description:
      "Tracks the price of physical gold. Hedge against inflation and equity drawdowns.",
    buriedFact:
      "Gold can underperform for 5–7 year stretches when equities boom.",
  },

  // ── CASH ──────────────────────────────────────────────────────────────────

  {
    id: "bharath_liquid_cash",
    name: "Bharath Liquid Fund",
    class: "cash",
    expenseRatio: 0.002, // 0.2%
    exitLoadPct: 0.0007, // negligible but present for 7-day window
    exitLoadPeriodDays: 7,
    description:
      "Ultra-short-term debt instruments. Safe, liquid, low return ~5–6%.",
    buriedFact:
      "Small exit load if redeemed within 7 days.",
  },
];

/** Quick O(1) lookup map built once at module load. */
export const ASSET_MAP: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a]),
);
