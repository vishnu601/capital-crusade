import type { StateCreator } from "zustand";
import type { GameStore } from "./index";
import type { GamePhase } from "@/types/game";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface UiSlice {
  // state
  phase:           GamePhase;
  selectedAssetId: string | null;
  isModalOpen:     boolean;
  // actions
  setPhase:        (phase: GamePhase) => void;
  setSelectedAsset:(id: string | null) => void;
  setModalOpen:    (open: boolean) => void;
  /**
   * Master reset — resets all slices and returns to the menu.
   * This is the only action that coordinates across slices.
   */
  resetGame: () => void;
}

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createUiSlice: StateCreator<GameStore, [], [], UiSlice> = (
  set,
  get,
) => ({
  phase:           "menu",
  selectedAssetId: null,
  isModalOpen:     false,

  setPhase:         (phase)    => set({ phase }),
  setSelectedAsset: (id)       => set({ selectedAssetId: id }),
  setModalOpen:     (open)     => set({ isModalOpen: open }),

  resetGame: () => {
    // Coordinate the reset across all slices via get()
    get().resetPlayer();
    get().resetMarket();
    get().resetPortfolio();
    get().clearLog();
    set({
      phase:           "menu",
      selectedAssetId: null,
      isModalOpen:     false,
    });
  },
});
