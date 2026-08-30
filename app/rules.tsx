import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useGame } from '@/contexts/GameContext';

const LOGO = require('@/assets/images/9d133403-fd40-4eab-b324-e93d60f637fa.jpeg');

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  lime: '#A8E63D',
  limeMuted: 'rgba(168,230,61,0.12)',
  border: 'rgba(255,255,255,0.06)',
};

const RULES = [
  { emoji: '☠️', text: 'You have ONE MINUTE to live' },
  { emoji: '🎯', text: 'Pick exactly 3 items — no more, no less' },
  { emoji: '⏱️', text: 'The clock starts when you tap START' },
  { emoji: '🧠', text: 'Your choices determine your fate' },
  { emoji: '🏆', text: 'Survive longer than everyone else' },
  { emoji: '📅', text: 'One new scenario drops every day at midnight' },
  { emoji: '🔥', text: 'Miss a day and your streak dies' },
];

export default function RulesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setOnboardingComplete } = useGame();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const ruleAnims = useRef(RULES.map(() => new Animated.Value(0))).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.stagger(
        300,
        ruleAnims.map(anim =>
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true })
        )
      ),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);
    sequence.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnderstand = async () => {
    console.log('[Rules] I Understand pressed');
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setOnboardingComplete();
    router.replace('/menu');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
      {/* Logo */}
      <Animated.View style={{ alignItems: 'center', marginBottom: 20, opacity: logoAnim, transform: [{ scale: logoAnim }] }}>
        <Image source={LOGO} style={{ width: 120, height: 120, borderRadius: 16 }} resizeMode="cover" />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={{
          fontFamily: 'SpaceMono',
          fontSize: 32,
          fontWeight: '700',
          color: COLORS.lime,
          textAlign: 'center',
          letterSpacing: 4,
          marginBottom: 28,
          opacity: titleAnim,
          transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}
      >
        THE RULES
      </Animated.Text>

      {/* Rules list */}
      <View style={{ flex: 1, gap: 12 }}>
        {RULES.map((rule, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: ruleAnims[i],
              transform: [{ translateX: ruleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: COLORS.border,
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 24 }}>{rule.emoji}</Text>
            <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 }}>
              {rule.text}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* CTA Button */}
      <Animated.View style={{ marginTop: 20, opacity: buttonAnim, transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <Pressable
          onPress={handleUnderstand}
          style={({ pressed }) => ({
            backgroundColor: COLORS.lime,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: COLORS.background, fontSize: 15, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' }}>
            I UNDERSTAND — LET'S SURVIVE
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
