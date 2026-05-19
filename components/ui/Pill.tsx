import { View } from "react-native";
import { AppText } from "./AppText";

type PillTone = "success" | "danger" | "neutral";

interface PillProps {
  label: string;
  tone?: PillTone;
}

const toneStyles: Record<PillTone, { bg: string; border: string; textColor: "success" | "danger" | "muted" }> = {
  success: { bg: "#134E4A", border: "#2DD4BF", textColor: "success" },
  danger:  { bg: "#4C1D1D", border: "#F87171", textColor: "danger" },
  neutral: { bg: "#1E2740", border: "#2A3450", textColor: "muted" },
};

export function Pill({ label, tone = "neutral" }: PillProps) {
  const s = toneStyles[tone];
  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderColor: s.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: "flex-start",
      }}
    >
      <AppText variant="micro" color={s.textColor}>{label}</AppText>
    </View>
  );
}
