import React from 'react';
// @ts-expect-error — unstable_native_tabs is SDK 54 path
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(play)">
        <Icon sf="bolt.fill" />
        <Label>Play</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(leaderboard)">
        <Icon sf="trophy.fill" />
        <Label>Leaderboard</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
