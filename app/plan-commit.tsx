import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }     from "@/components/ui/AppText";
import { Button }      from "@/components/ui/Button";
import { BullAgent }   from "@/components/bull/BullAgent";
import { BullSpeech }  from "@/components/bull/BullSpeech";
import { CorridorBar } from "@/components/ui/CorridorBar";
import { GOALS }       from "@/lib/constants";
import { isInsideCorridor } from "@/lib/selectors";
import type { CommittedPlan, GoalId } from "@/types/game";
import { useGameStore } from "@/store/index";

// ─── Types ────────────────────────────────────────────────────────────────────

type Alloc = { equity: number; debt: number; gold: number; cash: number };
type AllocKey = keyof Alloc;
const ALLOC_KEYS: AllocKey[] = ["equity", "debt", "gold", "cash"];

type RebalanceRule = CommittedPlan["rebalanceRule"];
type PanicRule     = CommittedPlan["panicSellRule"];

// ─── Goal defaults (sum to 100) ───────────────────────────────────────────────

const GOAL_DEFAULTS: Record<GoalId, Alloc> = {
  retirement_long: { equity: 70, debt: 15, gold: 10, cash: 5 },
  house_medium:    { equity: 30, debt: 55, gold: 10, cash: 5 },
  wealth_medium:   { equity: 65, debt: 20, gold: 10, cash: 5 },
  emergency_short: { equity: 5,  debt: 45, gold: 10, cash: 40 },
};

// ─── Linked slider math ───────────────────────────────────────────────────────

/**
 * When `changedKey` moves to `rawValue`, redistribute the delta proportionally
 * across the other three keys to keep the total at exactly 100.
 */
function adjustAllocation(alloc: Alloc, changedKey: AllocKey, rawValue: number): Alloc {
  const snapped   = Math.round(rawValue / 5) * 5;
  const newVal    = Math.max(0, Math.min(100, snapped));
  const delta     = newVal - alloc[changedKey];
  if (delta === 0) return alloc;

  const others     = ALLOC_KEYS.filter((k) => k !== changedKey) as AllocKey[];
  const othersSum  = others.reduce((s, k) => s + alloc[k], 0);

  // Can't increase if nothing left in others
  if (delta > 0 && othersSum === 0) return alloc;

  // Clamp increase to what's available
  const available    = delta > 0 ? Math.min(delta, othersSum) : delta;
  const actualNewVal = alloc[changedKey] + available;
  const toDistribute = -available; // how much others must change

  const result: Alloc = { ...alloc, [changedKey]: actualNewVal };

  // Distribute proportionally, rounding to nearest 5
  let distributed = 0;
  for (let i = 0; i < others.length - 1; i++) {
    const k          = others[i];
    const proportion = othersSum > 0 ? alloc[k] / othersSum : 1 / others.length;
    const adj        = Math.round((proportion * toDistribute) / 5) * 5;
    result[k]        = Math.max(0, alloc[k] + adj);
    distributed     += result[k] - alloc[k];
  }

  // Last absorbs rounding error
  const lastKey  = others[others.length - 1];
  result[lastKey] = Math.max(0, alloc[lastKey] + toDistribute - distributed);

  // Final safety: force sum to 100 by nudging the changed key
  const total = ALLOC_KEYS.reduce((s, k) => s + result[k], 0);
  if (total !== 100) {
    result[changedKey] = Math.max(0, result[changedKey] + (100 - total));
  }

  return result;
}

// ─── Slider colours ───────────────────────────────────────────────────────────

const TRACK_COLOR: Record<AllocKey, string> = {
  equity: "#2DD4BF",
  debt:   "#6B8FFF",
  gold:   "#FFB627",
  cash:   "#8B95A7",
};

const LABEL: Record<AllocKey, string> = {
  equity: "Equity",
  debt:   "Debt",
  gold:   "Gold",
  cash:   "Cash",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlanCommitScreen() {
  const selectedGoal  = useGameStore((s) => s.selectedGoal);
  const committedPlan = useGameStore((s) => s.committedPlan);
  const commitPlan    = useGameStore((s) => s.commitPlan);
  const setSkipped    = useGameStore((s) => s.setSkippedBriefing);
  const currentDay    = useGameStore((s) => s.currentDay);
  const logEvent      = useGameStore((s) => s.logEvent);

  // Guard
  if (!selectedGoal) {
    router.replace("/goal-select");
    return null;
  }

  const goal = GOALS[selectedGoal];

  // Pre-fill from existing committed plan (e.g., coming back from /ready)
  const initAlloc: Alloc = committedPlan?.targetAllocation
    ? {
        equity: committedPlan.targetAllocation.equity,
        debt:   committedPlan.targetAllocation.debt,
        gold:   committedPlan.targetAllocation.gold,
        cash:   committedPlan.targetAllocation.cash,
      }
    : GOAL_DEFAULTS[selectedGoal];

  const [alloc,     setAlloc]     = useState<Alloc>(initAlloc);
  const [rebalance, setRebalance] = useState<RebalanceRule>(committedPlan?.rebalanceRule ?? "drift_25");
  const [panic,     setPanic]     = useState<PanicRule>(committedPlan?.panicSellRule ?? "never");

  const total     = ALLOC_KEYS.reduce((s, k) => s + alloc[k], 0);
  const inCorridor = isInsideCorridor(alloc, goal.corridor);

  const handleSlider = (key: AllocKey, val: number) => {
    setAlloc((prev) => adjustAllocation(prev, key, val));
  };

  const handleLockIn = () => {
    commitPlan({ targetAllocation: alloc, rebalanceRule: rebalance, panicSellRule: panic });
    router.push("/ready");
  };

  const handleSkip = () => {
    const defaultPlan: CommittedPlan = {
      targetAllocation: { equity: 60, debt: 30, gold: 5, cash: 5 },
      rebalanceRule: "drift_25",
      panicSellRule: "drop_40",
    };
    commitPlan(defaultPlan);
    setSkipped(true);
    logEvent({ type: "plan_committed", day: currentDay, payload: { skipped: true } });
    router.push("/ready");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mini bull ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", paddingTop: 16, gap: 12, marginBottom: 20 }}>
          <BullAgent size={60} expression="thinking" animated />
          <View style={{ flex: 1, paddingTop: 4 }}>
            <BullSpeech
              text="Commit to your allocation. You can break this later — but I'll know."
              speed="fast"
              tail="left"
            />
          </View>
        </View>

        {/* ── Goal summary ─────────────────────────────────────────────── */}
        <View style={{ backgroundColor: "#141B2D", borderRadius: 14, borderWidth: 1, borderColor: "#2A3450", padding: 14, marginBottom: 24, gap: 8 }}>
          <AppText variant="caption" color="muted">YOUR GOAL</AppText>
          <AppText variant="heading" color="primary">{goal.title}</AppText>
          <AppText variant="caption" color="muted">Recommended corridor</AppText>
          <CorridorBar
            allocation={{
              equity: (goal.corridor.equity[0] + goal.corridor.equity[1]) / 2,
              debt:   (goal.corridor.debt[0]   + goal.corridor.debt[1])   / 2,
              gold:   (goal.corridor.gold[0]   + goal.corridor.gold[1])   / 2,
              cash:   (goal.corridor.cash[0]   + goal.corridor.cash[1])   / 2,
            }}
            height={14}
          />
        </View>

        {/* ── Allocation sliders ────────────────────────────────────────── */}
        <AppText variant="heading" color="primary" style={{ marginBottom: 16 }}>
          Target allocation
        </AppText>

        <View style={{ gap: 20, marginBottom: 12 }}>
          {ALLOC_KEYS.map((key) => (
            <View key={key} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <AppText variant="caption" color="secondary">{LABEL[key]}</AppText>
                <AppText variant="caption" style={{ color: TRACK_COLOR[key], fontFamily: "Inter_700Bold" }}>
                  {alloc[key]}%
                </AppText>
              </View>
              <Slider
                style={{ width: "100%", height: 36 }}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={alloc[key]}
                onValueChange={(v) => handleSlider(key, v)}
                minimumTrackTintColor={TRACK_COLOR[key]}
                maximumTrackTintColor="#2A3450"
                thumbTintColor={TRACK_COLOR[key]}
              />
            </View>
          ))}
        </View>

        {/* Sum indicator */}
        <AppText
          variant="caption"
          style={{ color: total === 100 ? "#2DD4BF" : "#F87171", marginBottom: 12, textAlign: "right" }}
        >
          Total: {total}% {total === 100 ? "✓" : "⚠"}
        </AppText>

        {/* Live allocation preview */}
        <CorridorBar allocation={alloc} height={20} showLabels rounded style={{ marginBottom: 10 }} />

        {/* Corridor indicator */}
        <AppText
          variant="caption"
          style={{ color: inCorridor ? "#2DD4BF" : "#FFB627", marginBottom: 28 }}
        >
          {inCorridor
            ? "✓ Inside your goal's corridor"
            : "⚠ Outside recommended corridor — that's allowed, but noted"}
        </AppText>

        {/* ── Discipline rules ─────────────────────────────────────────── */}
        <AppText variant="heading" color="primary" style={{ marginBottom: 16 }}>
          Discipline rules
        </AppText>

        <View style={{ gap: 20, marginBottom: 36 }}>
          <View style={{ gap: 8 }}>
            <AppText variant="caption" color="muted">Rebalance when</AppText>
            <SegmentedControl
              options={["manual", "drift_15", "drift_25"] as const}
              value={rebalance}
              onChange={setRebalance}
              labels={{ manual: "Manual", drift_15: "Drift > 15%", drift_25: "Drift > 25%" }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <AppText variant="caption" color="muted">Panic-sell trigger</AppText>
            <SegmentedControl
              options={["never", "drop_25", "drop_40"] as const}
              value={panic}
              onChange={setPanic}
              labels={{ never: "Never", drop_25: "Drop > 25%", drop_40: "Drop > 40%" }}
            />
          </View>
        </View>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <View style={{ gap: 12 }}>
          <Button label="Lock in strategy" variant="primary" onPress={handleLockIn} />
          <Button label="Skip — wing it"   variant="ghost"   onPress={handleSkip} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
}) {
  return (
    <View style={{ flexDirection: "row", borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#2A3450" }}>
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 4,
            alignItems: "center",
            backgroundColor: value === opt ? "#FFB627" : "#141B2D",
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: "#2A3450",
          }}
        >
          <AppText
            variant="caption"
            style={{
              color: value === opt ? "#0A0E1A" : "#8B95A7",
              fontFamily: value === opt ? "Inter_600SemiBold" : "Inter_400Regular",
              textAlign: "center",
            }}
          >
            {labels[opt]}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
