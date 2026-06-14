import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }  from "@/components/ui/AppText";
import { Button }   from "@/components/ui/Button";
import { BullScene } from "@/components/bull/BullScene";
import { useGameStore } from "@/store/index";

// ─── Speech lines ─────────────────────────────────────────────────────────────

const LINES = [
  "Welcome to the markets. I'm Duri. For the next ten minutes, I'm your coach.",
  "You've got ₹1,00,000 and ten years. The market will throw news, crashes, and noise at you. Most players panic. The disciplined ones don't.",
  "Before we start, you'll pick a goal, study your options, and commit to a strategy. You can skip any of it. But what you skip tends to come back as a lesson.",
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BriefingScreen() {
  const [step, setStep]           = useState(0);
  const [speechDone, setSpeechDone] = useState(false);

  const setSkippedBriefing = useGameStore((s) => s.setSkippedBriefing);
  const logEvent           = useGameStore((s) => s.logEvent);
  const currentDay         = useGameStore((s) => s.currentDay);

  const isLastStep = step === LINES.length - 1;

  const handleContinue = () => {
    setSpeechDone(false);
    setStep((s) => s + 1);
  };

  const handleReady = () => {
    router.push("/goal-select");
  };

  const handleSkip = () => {
    setSkippedBriefing(true);
    logEvent({ type: "briefing_skipped", day: currentDay, payload: {} });
    router.push("/goal-select");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>

        {/* ── Bull scene — takes most of the vertical space ───────────── */}
        <View style={{ flex: 1, justifyContent: "center", paddingTop: 24 }}>
          <BullScene
            text={LINES[step]}
            expression="neutral"
            layout="vertical"
            bullSize={160}
            onSpeechComplete={() => setSpeechDone(true)}
          />
        </View>

        {/* ── Action area ─────────────────────────────────────────────── */}
        <View style={{ paddingBottom: 24, gap: 12, minHeight: 100 }}>
          {speechDone && !isLastStep && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Button label="Continue" variant="primary" onPress={handleContinue} />
            </Animated.View>
          )}

          {speechDone && isLastStep && (
            <Animated.View entering={FadeIn.duration(200)} style={{ gap: 12 }}>
              <Button label="I'm ready" variant="primary" onPress={handleReady} />
              <Button
                label="Skip briefing, just play"
                variant="ghost"
                onPress={handleSkip}
              />
            </Animated.View>
          )}

          {/* Step dots */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
            {LINES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === step ? "#FFB627" : "#2A3450",
                }}
              />
            ))}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
