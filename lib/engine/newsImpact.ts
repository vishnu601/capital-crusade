/**
 * News impact definitions and application logic.
 *
 * NEWS_IMPACTS maps each NewsCategory to per-asset-class shocks.
 * Each shock has a dailyReturnAdjustment (added to log-return each day)
 * and a durationDays (how many days it lasts, independently per class).
 *
 * applyNewsImpacts() bakes all shocks into the base GBM paths so the
 * game loop can just read pricePaths[id][day] each tick.
 */

import type { NewsCategory, NewsEvent, AssetClass } from "@/types/game";
import type { Asset }                               from "@/types/game";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetClassShock = {
  dailyReturnAdjustment: number;
  durationDays: number;
};

type NewsImpact = Record<AssetClass, AssetClassShock>;

// ─── Impact table ─────────────────────────────────────────────────────────────

export const NEWS_IMPACTS_TABLE: Record<NewsCategory, NewsImpact> = {
  rate_hike: {
    equity: { dailyReturnAdjustment: -0.002, durationDays: 7  },
    debt:   { dailyReturnAdjustment: -0.005, durationDays: 14 },
    gold:   { dailyReturnAdjustment:  0.001, durationDays: 5  },
    cash:   { dailyReturnAdjustment:  0.0005, durationDays: 30 },
  },
  rate_cut: {
    equity: { dailyReturnAdjustment:  0.003, durationDays: 7  },
    debt:   { dailyReturnAdjustment:  0.004, durationDays: 14 },
    gold:   { dailyReturnAdjustment: -0.001, durationDays: 5  },
    cash:   { dailyReturnAdjustment: -0.0003, durationDays: 30 },
  },
  earnings_beat: {
    equity: { dailyReturnAdjustment:  0.004, durationDays: 5 },
    debt:   { dailyReturnAdjustment:  0,     durationDays: 0 },
    gold:   { dailyReturnAdjustment: -0.001, durationDays: 3 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0 },
  },
  earnings_miss: {
    equity: { dailyReturnAdjustment: -0.005, durationDays: 7 },
    debt:   { dailyReturnAdjustment:  0.001, durationDays: 3 },
    gold:   { dailyReturnAdjustment:  0.001, durationDays: 3 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0 },
  },
  global_crisis: {
    equity: { dailyReturnAdjustment: -0.012, durationDays: 10 },
    debt:   { dailyReturnAdjustment:  0.001, durationDays: 5  },
    gold:   { dailyReturnAdjustment:  0.008, durationDays: 14 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0  },
  },
  inflation_spike: {
    equity: { dailyReturnAdjustment: -0.003, durationDays: 10 },
    debt:   { dailyReturnAdjustment: -0.003, durationDays: 14 },
    gold:   { dailyReturnAdjustment:  0.005, durationDays: 14 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0  },
  },
  budget_positive: {
    equity: { dailyReturnAdjustment:  0.003, durationDays: 5 },
    debt:   { dailyReturnAdjustment:  0.001, durationDays: 5 },
    gold:   { dailyReturnAdjustment:  0,     durationDays: 0 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0 },
  },
  budget_negative: {
    equity: { dailyReturnAdjustment: -0.004, durationDays: 7 },
    debt:   { dailyReturnAdjustment: -0.001, durationDays: 5 },
    gold:   { dailyReturnAdjustment:  0.002, durationDays: 5 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0 },
  },
  currency_weakness: {
    equity: { dailyReturnAdjustment: -0.002, durationDays: 7  },
    debt:   { dailyReturnAdjustment: -0.002, durationDays: 7  },
    gold:   { dailyReturnAdjustment:  0.005, durationDays: 10 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0  },
  },
  tax_law_change: {
    equity: { dailyReturnAdjustment: -0.002, durationDays: 5 },
    debt:   { dailyReturnAdjustment:  0,     durationDays: 0 },
    gold:   { dailyReturnAdjustment:  0,     durationDays: 0 },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0 },
  },
  small_cap_rally: {
    equity: { dailyReturnAdjustment:  0.005, durationDays: 10 },
    debt:   { dailyReturnAdjustment:  0,     durationDays: 0  },
    gold:   { dailyReturnAdjustment:  0,     durationDays: 0  },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0  },
  },
  small_cap_crash: {
    equity: { dailyReturnAdjustment: -0.008, durationDays: 12 },
    debt:   { dailyReturnAdjustment:  0.001, durationDays: 5  },
    gold:   { dailyReturnAdjustment:  0.003, durationDays: 7  },
    cash:   { dailyReturnAdjustment:  0,     durationDays: 0  },
  },
};

// Convenience alias matching the import name used in marketSlice
export { NEWS_IMPACTS_TABLE as NEWS_IMPACTS };

/**
 * Categories where bharath_smallcap_eq gets an EXTRA 1.8× multiplier
 * on top of the equity-class shock.
 */
export const SMALL_CAP_AMPLIFIER = 1.8;
export const SMALL_CAP_AMPLIFIED_CATEGORIES: NewsCategory[] = [
  "small_cap_rally",
  "small_cap_crash",
];

// ─── Application ─────────────────────────────────────────────────────────────

/**
 * Bake all news impacts into the base GBM paths.
 *
 * For each event, for each asset, the daily log-return is shifted by
 * `dailyReturnAdjustment` for `durationDays` days starting from event.day+1.
 * Because we rebuild the path using `result[d] = result[d-1] × baseReturn × exp(adj[d])`,
 * shocks compound correctly into all subsequent prices.
 */
export function applyNewsImpacts(
  basePaths: Record<string, number[]>,
  news:      NewsEvent[],
  assets:    Asset[],
): Record<string, number[]> {
  const assetIds = Object.keys(basePaths);
  const pathLen  = basePaths[assetIds[0]].length;

  // Accumulate total daily log-return adjustments per asset
  const dailyAdj: Record<string, number[]> = {};
  for (const id of assetIds) {
    dailyAdj[id] = new Array<number>(pathLen).fill(0);
  }

  for (const event of news) {
    const impact = NEWS_IMPACTS_TABLE[event.category];

    for (const asset of assets) {
      const classShock = impact[asset.class as AssetClass];
      if (!classShock || classShock.durationDays === 0) continue;

      let adj = classShock.dailyReturnAdjustment;
      if (adj === 0) continue;

      // Extra amplification for small-cap specific events
      if (
        SMALL_CAP_AMPLIFIED_CATEGORIES.includes(event.category) &&
        asset.id === "bharath_smallcap_eq"
      ) {
        adj *= SMALL_CAP_AMPLIFIER;
      }

      const start = Math.min(event.day + 1, pathLen - 1);
      const end   = Math.min(event.day + classShock.durationDays, pathLen - 1);
      for (let d = start; d <= end; d++) {
        dailyAdj[asset.id][d] += adj;
      }
    }
  }

  // Rebuild paths: each day's price uses the base daily return × the news shock
  const result: Record<string, number[]> = {};
  for (const id of assetIds) {
    const base = basePaths[id];
    const adj  = dailyAdj[id];
    const path = new Array<number>(pathLen);
    path[0]    = base[0];
    for (let d = 1; d < pathLen; d++) {
      const baseReturn = base[d] / base[d - 1];
      path[d]          = path[d - 1] * baseReturn * Math.exp(adj[d]);
    }
    result[id] = path;
  }

  return result;
}
