import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GameProvider } from "@/contexts/GameContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { useGame } from "@/contexts/GameContext";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};


function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const { onboardingComplete, isLoading: gameLoading } = useGame();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || gameLoading) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (onOnboarding) return;
    if (!onboardingComplete) return;
    const onPaywall = pathname === "/paywall";
    if (onPaywall) return;
    if (!isSubscribed) {
      router.replace("/paywall");
    }
  }, [isSubscribed, loading, gameLoading, onboardingComplete, pathname]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "SpaceMono-Bold": require("../assets/fonts/SpaceMono-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "#FF4444",
      background: "#0A0A0F",
      card: "#13131A",
      text: "#F0F0F8",
      border: "rgba(255,255,255,0.06)",
      notification: "#FF4444",
    },
  };

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    colors: {
      primary: "#FF4444",
      background: "#0A0A0F",
      card: "#13131A",
      text: "#F0F0F8",
      border: "rgba(255,255,255,0.06)",
      notification: "#FF4444",
    },
  };

  return (
    <SubscriptionProvider>
          <SubscriptionRedirect />
  <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}>
        <SafeAreaProvider>
          <GameProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0F" } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: "fullScreenModal" }} />
                <Stack.Screen
                  name="outcome"
                  options={{
                    headerShown: false,
                    presentation: "modal",
                    contentStyle: { backgroundColor: "#0A0A0F" },
                  }}
                />
                <Stack.Screen
                  name="auth-prompt"
                  options={{
                    headerShown: false,
                    presentation: "formSheet",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [0.5, 0.75],
                    contentStyle: { backgroundColor: "transparent" },
                  }}
                />
              </Stack>
              <SystemBars style="light" />
            </GestureHandlerRootView>
          </GameProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
    </SubscriptionProvider>
  );
}
