import { Pressable, ActivityIndicator, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = "primary", loading = false, disabled = false, className = "" }: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withTiming(0.96, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 80 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }
  };

  const isDisabled = disabled || loading;

  const containerClass = (() => {
    if (variant === "primary") {
      return `rounded-xl px-6 py-3.5 items-center justify-center ${isDisabled ? "opacity-40" : "bg-accent-bull"}`;
    }
    if (variant === "secondary") {
      return `rounded-xl px-6 py-3.5 items-center justify-center border border-accent-bull ${isDisabled ? "opacity-40" : ""}`;
    }
    return `rounded-xl px-6 py-3.5 items-center justify-center ${isDisabled ? "opacity-40" : ""}`;
  })();

  // For primary: dark text on gold. For secondary/ghost: gold text.
  const resolvedTextColor: "primary" | "bull" = variant === "primary" ? "primary" : "bull";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`${className}`}
    >
      <View className={containerClass}>
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#0A0E1A" : "#FFB627"} size="small" />
        ) : (
          <AppText
            variant="heading"
            style={{
              color: variant === "primary" ? "#0A0E1A" : "#FFB627",
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {label}
          </AppText>
        )}
      </View>
    </AnimatedPressable>
  );
}
