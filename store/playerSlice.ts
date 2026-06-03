import type { StateCreator } from "zustand";
import type { GameStore } from "./index";
import type { GoalId, CommittedPlan } from "@/types/game";

// ─── Slice type ───────────────────────────────────────────────────────────────

export interface PlayerSlice {
  // state
  selectedGoal: GoalId | null;
  committedPlan: CommittedPlan | null;
  skippedBriefing: boolean;
  // actions
  selectGoal: (goalId: GoalId) => void;
  commitPlan: (plan: CommittedPlan) => void;
  setSkippedBriefing: (skipped: boolean) => void;
  /** Internal — called by resetGame to wipe player state. */
  resetPlayer: () => void;
}

// ─── Slice creator ────────────────────────────────────────────────────────────

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerSlice> = (
  set,
  get,
) => ({
  selectedGoal:    null,
  committedPlan:   null,
  skippedBriefing: false,

  selectGoal: (goalId) => {
    set({ selectedGoal: goalId });
    get().logEvent({
      type:    "goal_selected",
      day:     get().currentDay,
      payload: { goalId },
    });
  },

  commitPlan: (plan) => {
    set({ committedPlan: plan });
    get().logEvent({
      type:    "plan_committed",
      day:     get().currentDay,
      payload: { plan },
    });
  },

  setSkippedBriefing: (skipped) => {
    set({ skippedBriefing: skipped });
    if (skipped) {
      get().logEvent({
        type:    "briefing_skipped",
        day:     get().currentDay,
        payload: {},
      });
    }
  },

  resetPlayer: () =>
    set({
      selectedGoal:    null,
      committedPlan:   null,
      skippedBriefing: false,
    }),
});
