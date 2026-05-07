import { View, Text } from "react-native";
import { MotiView } from "moti";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
      >
        <Text className="text-5xl font-bold text-accent-bull text-center">
          Capital Crusade
        </Text>
        <Text className="text-base text-text-muted text-center mt-3">
          v0.1 — wired up correctly
        </Text>
      </MotiView>
    </View>
  );
}
