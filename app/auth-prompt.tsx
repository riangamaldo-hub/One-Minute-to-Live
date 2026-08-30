import React from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceSecondary: '#1C1C26',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  textTertiary: '#5A5A72',
  primary: '#FF4444',
  primaryMuted: 'rgba(255, 68, 68, 0.12)',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  border: 'rgba(255, 255, 255, 0.06)',
};

const BENEFITS = [
  { emoji: '🔥', title: 'Save your streak', desc: 'Track consecutive days played' },
  { emoji: '🏆', title: 'Appear on leaderboard', desc: 'Compete with players worldwide' },
  { emoji: '🧠', title: 'Track Survival IQ', desc: 'Watch your score grow over time' },
];

export default function AuthPromptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSignIn = () => {
    console.log('[AuthPrompt] Sign in pressed');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.dismiss();
  };

  const handleContinueAsGuest = () => {
    console.log('[AuthPrompt] Continue as guest pressed');
    router.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingHorizontal: 24, paddingTop: 32, paddingBottom: insets.bottom + 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>💀</Text>
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 }}>
          Don't lose your progress
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
          Sign in to save your score, track your streak, and compete on the global leaderboard.
        </Text>
      </View>

      <View style={{ gap: 12, marginBottom: 32 }}>
        {BENEFITS.map((benefit) => (
          <View
            key={benefit.title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>{benefit.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>
                {benefit.title}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                {benefit.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Pressable
          onPress={handleSignIn}
          style={({ pressed }) => ({
            backgroundColor: COLORS.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.35)',
          })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
            {Platform.OS === 'ios' ? 'Sign in with Apple' : 'Sign In'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleContinueAsGuest}
          style={({ pressed }) => ({
            paddingVertical: 14,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' }}>
            Continue as Guest
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
