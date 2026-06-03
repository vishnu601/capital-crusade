import { create } from "zustand";
import { createPlayerSlice, PlayerSlice } from "./playerSlice";
import { createMarketSlice, MarketSlice } from "./marketSlice";
import { createPortfolioSlice, PortfolioSlice } from "./portfolioSlice";
import { createLogSlice, LogSlice } from "./logSlice";
import { createUiSlice, UiSlice } from "./uiSlice";

// ─── Combined store type ──────────────────────────────────────────────────────

/**
 * GameStore is the union of every slice.
 * Because the Zustand slice pattern uses forward-type references, each
 * StateCreator<GameStore, …> gets cross-slice access through get().
 */
export type GameStore =
  PlayerSlice &
  MarketSlice &
  PortfolioSlice &
  LogSlice &
  UiSlice;

// ─── Store instance ───────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()((...a) => ({
  ...createPlayerSlice(...a),
  ...createMarketSlice(...a),
  ...createPortfolioSlice(...a),
  ...createLogSlice(...a),
  ...createUiSlice(...a),
}));
