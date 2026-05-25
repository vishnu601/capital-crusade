import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padded?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, onPress, className = "", padded = true }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withTiming(0.96, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 80 });
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View
        className={`bg-bg-elevated rounded-2xl border border-border-subtle ${padded ? "p-4" : ""} ${className}`}
      >
        {children}
      </View>
    </AnimatedPressable>
  );
}
