import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// @ts-expect-error — unstable_native_tabs is SDK 54 path
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleHomePress = () => {
    console.log('[iOS TabLayout] Home button pressed, navigating to /menu');
    router.push('/menu');
  };

  const tabBarBottom = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={styles.container}>
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

      {/* Floating home button centered above the native tab bar */}
      <TouchableOpacity
        style={[styles.homeButton, { bottom: tabBarBottom + 44 }]}
        onPress={handleHomePress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="home" size={24} color="#0A0A0F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeButton: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A8E63D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
