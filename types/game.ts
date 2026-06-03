// =============================================================================
// Capital Crusade — core game types
// All types live here. Import from '@/types/game' everywhere.
// =============================================================================

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalId =
  | "retirement_long"
  | "house_medium"
  | "wealth_medium"
  | "emergency_short";

export interface AllocationCorridor {
  equity: [number, number]; // [min%, max%]
  debt:   [number, number];
  gold:   [number, number];
  cash:   [number, number];
}

export interface Goal {
  id: GoalId;
  title: string;
  description: string;
  horizonYears: number;
  corridor: AllocationCorridor;
  /** Concentration cap — no single asset may exceed this % of portfolio */
  maxSingleAssetPct: number;
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export type AssetClass = "equity" | "debt" | "gold" | "cash";

export interface Asset {
  id: string;
  name: string;
  class: AssetClass;
  /** Annual expense ratio as a decimal, e.g. 0.012 = 1.2% */
  expenseRatio: number;
  /** Exit load charged as a fraction of redemption value */
  exitLoadPct: number;
  /** Exit load applies only if sold within this many days of purchase */
  exitLoadPeriodDays: number;
  /** Flavour text shown in the dossier — contains hidden gotchas */
  description: string;
  /** The specific punishing detail the debrief will surface */
  buriedFact: string;
}

// ─── Market ──────────────────────────────────────────────────────────────────

export interface MarketState {
  currentDay: number;   // 0 to 3650 (10 years)
  currentYear: number;  // convenience: floor(currentDay / 365)
  isRunning: boolean;
  speed: 1 | 2 | 4;
  /** Current NAV per unit for every asset, keyed by assetId */
  prices: Record<string, number>;
  /** Full daily NAV history per asset — index = day number */
  priceHistory: Record<string, number[]>;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface Holding {
  assetId: string;
  units: number;
  avgCostPerUnit: number;
  /** Day number when first purchased — used for exit load and STCG calc */
  firstBoughtDay: number;
}

export interface PortfolioState {
  /** Uninvested cash available to deploy */
  cash: number;
  holdings: Holding[];
  transactionCostsPaid: number;
  taxesPaid: number;
  exitLoadsPaid: number;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface CommittedPlan {
  targetAllocation: {
    equity: number;
    debt: number;
    gold: number;
    cash: number;
  };
  rebalanceRule: "manual" | "drift_15" | "drift_25";
  panicSellRule: "never" | "drop_25" | "drop_40";
}

export interface PlayerState {
  selectedGoal: GoalId | null;
  committedPlan: CommittedPlan | null;
  skippedBriefing: boolean;
}

// ─── Log ─────────────────────────────────────────────────────────────────────

export type LogEventType =
  | "briefing_skipped"
  | "goal_selected"
  | "plan_committed"
  | "transaction"
  | "news_event"
  | "plan_break_detected"
  | "panic_sell_detected"
  | "game_started"
  | "game_ended";

export interface LogEvent {
  type: LogEventType;
  day: number;
  timestamp: number; // real-world ms (Date.now())
  payload: Record<string, unknown>;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type GamePhase =
  | "menu"
  | "briefing"
  | "goal_select"
  | "dossier"
  | "plan_commit"
  | "simulation"
  | "settlement"
  | "debrief";

export interface UiState {
  phase: GamePhase;
  selectedAssetId: string | null;
  isModalOpen: boolean;
}
