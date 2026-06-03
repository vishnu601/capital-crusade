import type { StateCreator } from "zustand";
import type { GameStore } from "./index";
import { ASSETS } from "@/lib/assets";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface MarketSlice {
  // state
  currentDay:   number;
  currentYear:  number;
  isRunning:    boolean;
  speed:        1 | 2 | 4;
  prices:       Record<string, number>;
  priceHistory: Record<string, number[]>;
  // actions
  /** Advance game clock by one day. Price updates are added in Prompt 5. */
  tick: () => void;
  setRunning: (running: boolean) => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  resetMarket: () => void;
}

// ─── Initial market state helper ─────────────────────────────────────────────

/** All assets start at NAV ₹100. Real price generation comes in Prompt 5. */
function buildInitialPrices(): Record<string, number> {
  return Object.fromEntries(ASSETS.map((a) => [a.id, 100]));
}

function buildInitialPriceHistory(): Record<string, number[]> {
  return Object.fromEntries(ASSETS.map((a) => [a.id, [100]]));
}

const INITIAL_PRICES  = buildInitialPrices();
const INITIAL_HISTORY = buildInitialPriceHistory();

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createMarketSlice: StateCreator<GameStore, [], [], MarketSlice> = (
  set,
  get,
) => ({
  currentDay:   0,
  currentYear:  0,
  isRunning:    false,
  speed:        1,
  prices:       { ...INITIAL_PRICES },
  priceHistory: { ...INITIAL_HISTORY },

  tick: () =>
    set((state) => {
      const nextDay  = state.currentDay + 1;
      const nextYear = Math.floor(nextDay / 365);
      // Prompt 5 will insert price simulation logic here.
      return { currentDay: nextDay, currentYear: nextYear };
    }),

  setRunning: (running) => set({ isRunning: running }),

  setSpeed: (speed) => set({ speed }),

  resetMarket: () =>
    set({
      currentDay:   0,
      currentYear:  0,
      isRunning:    false,
      speed:        1,
      prices:       { ...INITIAL_PRICES },
      priceHistory: { ...INITIAL_HISTORY },
    }),
});
