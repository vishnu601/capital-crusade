/**
 * Pure selector functions — no store access, no side effects.
 * Each function takes state slices as plain arguments and returns a derived value.
 * Safe to unit-test in isolation.
 */

import type {
  PortfolioState,
  AllocationCorridor,
  AssetClass,
} from "@/types/game";
import { ASSET_MAP } from "@/lib/assets";
import { STARTING_CAPITAL } from "@/lib/constants";

// ─── Portfolio value ──────────────────────────────────────────────────────────

/**
 * Total portfolio value = uninvested cash + market value of all holdings.
 * @returns Value in rupees.
 */
export function calculatePortfolioValue(
  portfolio: PortfolioState,
  prices: Record<string, number>,
): number {
  const holdingsValue = portfolio.holdings.reduce((sum, h) => {
    const price = prices[h.assetId] ?? 0;
    return sum + h.units * price;
  }, 0);
  return portfolio.cash + holdingsValue;
}

// ─── Allocation ───────────────────────────────────────────────────────────────

/**
 * Allocation percentages by asset class, summing to ~100.
 * Uninvested cash is counted as the "cash" class.
 * Returns a Record so callers can spread into their own objects.
 *
 * @example
 * // { equity: 65, debt: 25, gold: 5, cash: 5 }
 */
export function calculateAllocation(
  portfolio: PortfolioState,
  prices: Record<string, number>,
): Record<AssetClass, number> {
  const total = calculatePortfolioValue(portfolio, prices);
  if (total === 0) return { equity: 0, debt: 0, gold: 0, cash: 100 };

  // Seed with uninvested cash as the "cash" class
  const valueByClass: Record<AssetClass, number> = {
    equity: 0,
    debt: 0,
    gold: 0,
    cash: portfolio.cash,
  };

  for (const h of portfolio.holdings) {
    const asset = ASSET_MAP[h.assetId];
    if (!asset) continue;
    valueByClass[asset.class] += h.units * (prices[h.assetId] ?? 0);
  }

  return {
    equity: (valueByClass.equity / total) * 100,
    debt:   (valueByClass.debt   / total) * 100,
    gold:   (valueByClass.gold   / total) * 100,
    cash:   (valueByClass.cash   / total) * 100,
  };
}

/**
 * Same as calculateAllocation but with an explicitly typed return object.
 * Use this where you need structural type safety on the property names.
 */
export function calculateAllocationPct(
  portfolio: PortfolioState,
  prices: Record<string, number>,
): { equity: number; debt: number; gold: number; cash: number } {
  const r = calculateAllocation(portfolio, prices);
  return { equity: r.equity, debt: r.debt, gold: r.gold, cash: r.cash };
}

// ─── Corridor check ───────────────────────────────────────────────────────────

/**
 * Returns true if the current allocation is inside every corridor band.
 * A band is [min, max] inclusive.
 */
export function isInsideCorridor(
  allocation: { equity: number; debt: number; gold: number; cash: number },
  corridor: AllocationCorridor,
): boolean {
  const check = (value: number, band: [number, number]) =>
    value >= band[0] && value <= band[1];

  return (
    check(allocation.equity, corridor.equity) &&
    check(allocation.debt,   corridor.debt)   &&
    check(allocation.gold,   corridor.gold)   &&
    check(allocation.cash,   corridor.cash)
  );
}

// ─── Concentration ────────────────────────────────────────────────────────────

/**
 * Returns the highest single-asset allocation as a percentage of total portfolio.
 * Used to enforce the per-goal maxSingleAssetPct concentration cap.
 *
 * @returns 0 if portfolio is empty, otherwise the max single-asset %.
 */
export function maxSingleAssetPct(
  portfolio: PortfolioState,
  prices: Record<string, number>,
): number {
  const total = calculatePortfolioValue(portfolio, prices);
  if (total === 0) return 0;

  let max = 0;
  for (const h of portfolio.holdings) {
    const value = h.units * (prices[h.assetId] ?? 0);
    const pct = (value / total) * 100;
    if (pct > max) max = pct;
  }
  return max;
}

// ─── Return ───────────────────────────────────────────────────────────────────

/**
 * Simple total return percentage relative to starting capital.
 *
 * @example
 * totalReturnPct(120_000, 100_000) // → 20.0
 * totalReturnPct(80_000, 100_000)  // → -20.0
 */
export function totalReturnPct(
  currentValue: number,
  startingCapital: number = STARTING_CAPITAL,
): number {
  if (startingCapital === 0) return 0;
  return ((currentValue - startingCapital) / startingCapital) * 100;
}
