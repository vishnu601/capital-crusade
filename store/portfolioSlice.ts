import type { StateCreator } from "zustand";
import type { GameStore } from "./index";
import type { Holding } from "@/types/game";
import { ASSET_MAP } from "@/lib/assets";
import {
  STARTING_CAPITAL,
  TRANSACTION_COST_PCT,
  STCG_RATE,
  STCG_THRESHOLD_DAYS,
} from "@/lib/constants";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface PortfolioSlice {
  // state
  cash:                  number;
  holdings:              Holding[];
  transactionCostsPaid:  number;
  taxesPaid:             number;
  exitLoadsPaid:         number;
  // actions
  /**
   * Placeholder buy: spends `rupees` of cash to acquire units at the current
   * price. Deducts transaction cost. Adds or merges holding.
   */
  buyAsset: (assetId: string, rupees: number) => void;
  /**
   * Placeholder sell: liquidates `units` of the holding at current price.
   * Applies transaction cost, exit load (if within window), and STCG (if < 1 yr).
   * NOTE: ELSS 3-year lock-in enforcement is added in Prompt 5.
   */
  sellAsset: (assetId: string, units: number) => void;
  resetPortfolio: () => void;
}

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createPortfolioSlice: StateCreator<
  GameStore,
  [],
  [],
  PortfolioSlice
> = (set, get) => ({
  cash:                 STARTING_CAPITAL,
  holdings:             [],
  transactionCostsPaid: 0,
  taxesPaid:            0,
  exitLoadsPaid:        0,

  // ── Buy ────────────────────────────────────────────────────────────────────
  buyAsset: (assetId, rupees) => {
    const state = get();
    const price = state.prices[assetId] ?? 100;

    // Guard: not enough cash (including transaction cost estimate)
    const totalCost = rupees * (1 + TRANSACTION_COST_PCT);
    if (totalCost > state.cash) return;

    const units   = rupees / price;
    const txCost  = rupees * TRANSACTION_COST_PCT;
    const cashOut = rupees + txCost;

    // Merge into existing holding or create new one
    const existingIdx = state.holdings.findIndex((h) => h.assetId === assetId);
    let newHoldings: Holding[];

    if (existingIdx >= 0) {
      const existing    = state.holdings[existingIdx];
      const newUnits    = existing.units + units;
      const newAvgCost  = (existing.units * existing.avgCostPerUnit + rupees) / newUnits;
      newHoldings = state.holdings.map((h, i) =>
        i === existingIdx
          ? { ...h, units: newUnits, avgCostPerUnit: newAvgCost }
          : h,
      );
    } else {
      newHoldings = [
        ...state.holdings,
        {
          assetId,
          units,
          avgCostPerUnit:  price,
          firstBoughtDay:  state.currentDay,
        },
      ];
    }

    set({
      cash:                  state.cash - cashOut,
      holdings:              newHoldings,
      transactionCostsPaid:  state.transactionCostsPaid + txCost,
    });

    get().logEvent({
      type:    "transaction",
      day:     state.currentDay,
      payload: { action: "buy", assetId, rupees, units, price, txCost },
    });
  },

  // ── Sell ───────────────────────────────────────────────────────────────────
  sellAsset: (assetId, units) => {
    const state      = get();
    const holdingIdx = state.holdings.findIndex((h) => h.assetId === assetId);
    if (holdingIdx < 0) return;

    const holding = state.holdings[holdingIdx];
    if (units > holding.units) return;

    const price      = state.prices[assetId] ?? 100;
    const proceeds   = units * price;
    const daysHeld   = state.currentDay - holding.firstBoughtDay;

    // Transaction cost
    const txCost = proceeds * TRANSACTION_COST_PCT;

    // Exit load — applies if sold within exitLoadPeriodDays
    const asset      = ASSET_MAP[assetId];
    const exitLoad   =
      asset && asset.exitLoadPct > 0 && daysHeld < asset.exitLoadPeriodDays
        ? proceeds * asset.exitLoadPct
        : 0;

    // Short-term capital gains tax on profit (if held < 1 year)
    const costBasis  = units * holding.avgCostPerUnit;
    const gain       = proceeds - costBasis;
    const tax        =
      daysHeld < STCG_THRESHOLD_DAYS && gain > 0 ? gain * STCG_RATE : 0;

    const netProceeds = proceeds - txCost - exitLoad - tax;

    // Remove holding if units now ~zero, otherwise reduce
    const remainingUnits = holding.units - units;
    const newHoldings =
      remainingUnits < 0.000_1
        ? state.holdings.filter((_, i) => i !== holdingIdx)
        : state.holdings.map((h, i) =>
            i === holdingIdx ? { ...h, units: remainingUnits } : h,
          );

    set({
      cash:                 state.cash + netProceeds,
      holdings:             newHoldings,
      transactionCostsPaid: state.transactionCostsPaid + txCost,
      taxesPaid:            state.taxesPaid + tax,
      exitLoadsPaid:        state.exitLoadsPaid + exitLoad,
    });

    get().logEvent({
      type:    "transaction",
      day:     state.currentDay,
      payload: { action: "sell", assetId, units, price, proceeds, txCost, exitLoad, tax, netProceeds },
    });
  },

  // ── Reset ──────────────────────────────────────────────────────────────────
  resetPortfolio: () =>
    set({
      cash:                 STARTING_CAPITAL,
      holdings:             [],
      transactionCostsPaid: 0,
      taxesPaid:            0,
      exitLoadsPaid:        0,
    }),
});
