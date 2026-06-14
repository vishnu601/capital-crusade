import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }      from "@/components/ui/AppText";
import { Button }       from "@/components/ui/Button";
import { BullAgent }    from "@/components/bull/BullAgent";
import { BullSpeech }   from "@/components/bull/BullSpeech";
import { CorridorBar, CorridorLegend } from "@/components/ui/CorridorBar";
import { GOALS }        from "@/lib/constants";
import type { GoalId }  from "@/types/game";
import { useGameStore } from "@/store/index";

// ─── All 4 goals in display order ────────────────────────────────────────────

const GOAL_ORDER: GoalId[] = [
  "retirement_long",
  "house_medium",
  "wealth_medium",
  "emergency_short",
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GoalSelectScreen() {
  const [pending, setPending] = useState<GoalId | null>(null);

  const selectGoal  = useGameStore((s) => s.selectGoal);
  const currentDay  = useGameStore((s) => s.currentDay);

  const handleConfirm = () => {
    if (!pending) return;
    selectGoal(pending);
    router.push("/dossier");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1 }}>

        {/* ── Mini bull + question ─────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          <BullAgent size={60} expression="thinking" animated />
          <View style={{ flex: 1, paddingTop: 4 }}>
            <BullSpeech
              text="What are you investing for?"
              speed="fast"
              tail="left"
            />
          </View>
        </View>

        <AppText
          variant="heading"
          color="primary"
          style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 12 }}
        >
          Choose your goal
        </AppText>

        {/* ── Goal cards ───────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {GOAL_ORDER.map((id) => (
            <GoalCard
              key={id}
              goalId={id}
              selected={pending === id}
              onPress={() => {
                setPending(id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          ))}

          <CorridorLegend />
        </ScrollView>

        {/* ── Confirm button (pinned to bottom) ────────────────────────── */}
        {pending && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#0A0E1A",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 28,
              borderTopWidth: 1,
              borderTopColor: "#2A3450",
            }}
          >
            <Button label="Confirm goal" variant="primary" onPress={handleConfirm} />
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({
  goalId,
  selected,
  onPress,
}: {
  goalId: GoalId;
  selected: boolean;
  onPress: () => void;
}) {
  const goal = GOALS[goalId];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn  = () => { scale.value = withTiming(0.98, { duration: 80 }); };
  const handlePressOut = () => { scale.value = withTiming(selected ? 1.02 : 1, { duration: 80 }); };

  // Corridor midpoints for the preview bar
  const mid = (range: [number, number]) => (range[0] + range[1]) / 2;
  const preview = {
    equity: mid(goal.corridor.equity),
    debt:   mid(goal.corridor.debt),
    gold:   mid(goal.corridor.gold),
    cash:   mid(goal.corridor.cash),
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View
          style={{
            backgroundColor: "#141B2D",
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: selected ? "#2DD4BF" : "#2A3450",
            padding: 16,
            gap: 8,
          }}
        >
          {/* Title row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText variant="heading" color="primary">{goal.title}</AppText>
            {selected && (
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#2DD4BF", alignItems: "center", justifyContent: "center" }}>
                <AppText style={{ color: "#0A0E1A", fontSize: 12, fontFamily: "Inter_700Bold" }}>✓</AppText>
              </View>
            )}
          </View>

          {/* Horizon */}
          <AppText variant="caption" color="muted">
            {goal.horizonYears}+ year horizon
          </AppText>

          {/* Description */}
          <AppText variant="body" color="secondary">
            {goal.description}
          </AppText>

          {/* Corridor preview bar */}
          <View style={{ marginTop: 4, gap: 6 }}>
            <CorridorBar allocation={preview} height={14} showLabels />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
