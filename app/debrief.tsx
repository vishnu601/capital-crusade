/**
 * /debrief — post-game analysis screen.
 *
 * Phase 5 stub — full behavioural scorecard, asset breakdown,
 * and rule-violation timeline arrive in the next build phase.
 */

import { View }         from "react-native";
import { router }       from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText }   from "@/components/ui/AppText";
import { Button }    from "@/components/ui/Button";
import { BullScene } from "@/components/bull/BullScene";
import { useGameStore } from "@/store/index";

export default function DebriefScreen() {
  const resetGame = useGameStore((s) => s.resetGame);

  const handlePlayAgain = () => {
    resetGame();
    router.replace("/");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingVertical: 24 }}>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <BullScene
            text="The full debrief — your allocation drift, panic moves, and tax drag — is coming in the next build. For now, you survived ten years. That's more than most."
            expression="pleased"
            layout="vertical"
            bullSize={160}
          />
        </View>

        <View style={{ gap: 12 }}>
          <AppText
            variant="caption"
            color="muted"
            style={{ textAlign: "center", marginBottom: 4 }}
          >
            🚧 Full behavioural scorecard coming soon
          </AppText>
          <Button label="Play again" variant="primary" onPress={handlePlayAgain} />
        </View>

      </View>
    </SafeAreaView>
  );
} 