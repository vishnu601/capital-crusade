import { View } from "react-native";
import { AppText } from "./AppText";

type IconCircleTone = "bull" | "success" | "danger" | "neutral";

interface IconCircleProps {
  emoji: string;
  tone?: IconCircleTone;
  size?: number;
}

const toneBg: Record<IconCircleTone, string> = {
  bull:    "#FFB627",
  success: "#134E4A",
  danger:  "#4C1D1D",
  neutral: "#1E2740",
};

export function IconCircle({ emoji, tone = "neutral", size = 44 }: IconCircleProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: toneBg[tone],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText style={{ fontSize: size * 0.44, lineHeight: size * 0.56 }}>{emoji}</AppText>
    </View>
  );
}
