import React from 'react';
import { View } from 'react-native';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionGuard } from "@/hooks/useSubscriptionGuard";

const TABS: TabBarItem[] = [
  {
    name: '(play)',
    route: '/(tabs)/(play)' as const,
    icon: 'bolt' as const,
    label: 'Play',
  },
  {
    name: '(leaderboard)',
    route: '/(tabs)/(leaderboard)' as const,
    icon: 'emoji-events' as const,
    label: 'Leaderboard',
  },
];

export default function TabLayout() {
  useSubscriptionGuard();

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#0A0A0F' } }}>
        <Stack.Screen name="(play)" />
        <Stack.Screen name="(leaderboard)" />
      </Stack>
      <FloatingTabBar tabs={TABS} containerWidth={280} bottomMargin={insets.bottom > 0 ? 8 : 20} />
    </View>
  );
}
