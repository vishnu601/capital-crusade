import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  className?: string;
}

export function Screen({ children, scrollable = false, padded = true, className = "" }: ScreenProps) {
  const inner = scrollable ? (
    <ScrollView
      className={`flex-1 ${padded ? "px-4" : ""} ${className}`}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? "px-4" : ""} ${className}`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {inner}
    </SafeAreaView>
  );
}
