import { useEffect, useRef, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "../ui/AppText";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BullSpeechProps {
  text: string;
  onComplete?: () => void;
  speed?: "slow" | "normal" | "fast";
  /** Which side the triangular tail points toward */
  tail?: "top" | "left";
}

const SPEED_MS: Record<"slow" | "normal" | "fast", number> = {
  slow:   65,
  normal: 32,
  fast:   14,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BullSpeech({
  text,
  onComplete,
  speed = "normal",
  tail = "top",
}: BullSpeechProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const hapticCounter = useRef(0);

  const finish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(text);
    setDone(true);
    onComplete?.();
  };

  useEffect(() => {
    // Reset on text change
    if (intervalRef.current) clearInterval(intervalRef.current);
    indexRef.current = 0;
    hapticCounter.current = 0;
    setDisplayed("");
    setDone(false);

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      hapticCounter.current += 1;
      if (hapticCounter.current % 5 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);
        onComplete?.();
      }
    }, SPEED_MS[speed]);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Re-run only when the text or speed changes
  }, [text, speed]);

  return (
    <View style={styles.wrapper}>
      {/* ── Triangle tail ─────────────────────────────────────────────────── */}
      {tail === "top" && (
        <View style={styles.tailTop} />
      )}
      {tail === "left" && (
        <View style={styles.tailLeft} />
      )}

      {/* ── Bubble ────────────────────────────────────────────────────────── */}
      <View style={styles.bubble}>
        <AppText variant="body" color="primary" style={styles.speechText}>
          {displayed}
          {!done && (
            <AppText variant="body" color="bull">
              {"▌"}
            </AppText>
          )}
        </AppText>

        {!done && (
          <Pressable onPress={finish} hitSlop={12} style={styles.skipBtn}>
            <AppText variant="caption" color="muted">
              Skip
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// Using StyleSheet here because NativeWind can't handle the triangle trick
// (borderWidth combos for CSS triangle) or precise absolute positioning.

const BUBBLE_BG  = "#1E2740";
const BORDER_CLR = "#2A3450";

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignSelf: "stretch",
  },
  bubble: {
    backgroundColor: BUBBLE_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_CLR,
    padding: 16,
    minHeight: 72,
  },
  speechText: {
    flexShrink: 1,
  },
  skipBtn: {
    position: "absolute",
    bottom: 10,
    right: 14,
  },
  // Top tail: points upward, centred horizontally
  tailTop: {
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 11,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: BUBBLE_BG,
    // Sit just above the bubble
    marginBottom: -1,
    zIndex: 1,
  },
  // Left tail: points leftward, aligned to top of bubble
  tailLeft: {
    position: "absolute",
    left: -10,
    top: 18,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: BUBBLE_BG,
  },
});
