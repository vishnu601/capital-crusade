import { useState, useEffect } from "react";
import { View } from "react-native";
import { BullAgent, BullAgentProps, BullExpression } from "./BullAgent";
import { BullSpeech } from "./BullSpeech";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BullSceneProps {
  text: string;
  expression?: BullExpression;
  onSpeechComplete?: () => void;
  layout?: "horizontal" | "vertical";
  bullSize?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BullScene({
  text,
  expression = "neutral",
  onSpeechComplete,
  layout = "vertical",
  bullSize = 140,
}: BullSceneProps) {
  const [speaking, setSpeaking] = useState(true);

  // Whenever text changes, start speaking again
  useEffect(() => {
    setSpeaking(true);
  }, [text]);

  const handleComplete = () => {
    setSpeaking(false);
    onSpeechComplete?.();
  };

  // While typing → speaking expression; afterwards → caller's expression
  const activeExpression: BullExpression = speaking ? "speaking" : expression;

  // ── Vertical layout (bull above speech bubble) ──────────────────────────
  if (layout === "vertical") {
    return (
      <View style={{ alignItems: "center", gap: 4 }}>
        <BullAgent size={bullSize} expression={activeExpression} animated />
        <BullSpeech text={text} onComplete={handleComplete} tail="top" />
      </View>
    );
  }

  // ── Horizontal layout (bull left, bubble right) ─────────────────────────
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <BullAgent size={bullSize} expression={activeExpression} animated />
      <View style={{ flex: 1 }}>
        <BullSpeech text={text} onComplete={handleComplete} tail="left" />
      </View>
    </View>
  );
}
