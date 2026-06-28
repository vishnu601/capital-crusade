import { View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { AppText }     from "@/components/ui/AppText";
import { Button }      from "@/components/ui/Button";
import { Card }        from "@/components/ui/Card";
import { BullScene }   from "@/components/bull/BullScene";
import { CorridorBar } from "@/components/ui/CorridorBar";
import { GOALS }       from "@/lib/constants";
import { useGameStore } from "@/store/index";

// ─── Rule labels ─────────────────────────────────────────────────────────────

const REBALANCE_LABEL = {
  manual:    "Manual only",
  drift_15:  "Auto at drift > 15%",
  drift_25:  "Auto at drift > 25%",
} as const;

const PANIC_LABEL = {
  never:   "Never sell on panic",
  drop_25: "Sell if market drops > 25%",
  drop_40: "Sell if market drops > 40%",
} as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReadyScreen() {
  const selectedGoal     = useGameStore((s) => s.selectedGoal);
  const committedPlan    = useGameStore((s) => s.committedPlan);
  const startSimulation  = useGameStore((s) => s.startSimulation);
  const [speechDone, setSpeechDone] = useState(false);

  // Guard
  if (!selectedGoal || !committedPlan) {
    router.replace("/plan-commit");
    return null;
  }

  const goal = GOALS[selectedGoal];
  const { targetAllocation: alloc, rebalanceRule, panicSellRule } = committedPlan;

  const handleBegin = () => {
    startSimulation();
    router.replace("/play");
  };

  const handleEdit = () => {
    router.push("/plan-commit");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>

        {/* ── Bull + speech ────────────────────────────────────────────── */}
        <View style={{ flex: 1, justifyContent: "center", paddingTop: 16 }}>
          <BullScene
            text="Goal locked. Strategy committed. The next ten minutes are yours. Don't react — decide."
            expression="pleased"
            layout="vertical"
            bullSize={180}
            onSpeechComplete={() => setSpeechDone(true)}
          />
        </View>

        {/* ── Plan summary card ────────────────────────────────────────── */}
        {speechDone && (
          <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
            <Card padded>
              <AppText variant="caption" color="muted" style={{ marginBottom: 10 }}>
                YOUR PLAN
              </AppText>

              {/* Goal */}
              <AppText variant="heading" color="primary" style={{ marginBottom: 4 }}>
                {goal.title}
              </AppText>
              <AppText variant="caption" color="muted" style={{ marginBottom: 12 }}>
                {goal.horizonYears}+ year horizon
              </AppText>

              {/* Allocation bar */}
              <CorridorBar allocation={alloc} height={18} showLabels style={{ marginBottom: 12 }} />

              {/* Allocation percentages */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <AllocLabel label="Equity" value={alloc.equity} color="#2DD4BF" />
                <AllocLabel label="Debt"   value={alloc.debt}   color="#6B8FFF" />
                <AllocLabel label="Gold"   value={alloc.gold}   color="#FFB627" />
                <AllocLabel label="Cash"   value={alloc.cash}   color="#8B95A7" />
              </View>

              {/* Rules */}
              <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: "#2A3450", paddingTop: 12 }}>
                <RuleRow label="Rebalance" value={REBALANCE_LABEL[rebalanceRule]} />
                <RuleRow label="Panic rule" value={PANIC_LABEL[panicSellRule]} />
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        {speechDone && (
          <Animated.View entering={FadeIn.duration(300)} style={{ gap: 12, paddingBottom: 24 }}>
            <Button label="Begin simulation" variant="primary" onPress={handleBegin} />
            <Button label="Edit my strategy" variant="ghost"   onPress={handleEdit} />
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function AllocLabel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <AppText style={{ color, fontFamily: "Inter_700Bold", fontSize: 18 }}>{value}%</AppText>
      <AppText variant="micro" color="muted">{label}</AppText>
    </View>
  );
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
      <AppText variant="caption" color="muted">{label}</AppText>
      <AppText variant="caption" color="secondary" style={{ textAlign: "right", flex: 1 }}>{value}</AppText>
    </View>
  );
}
