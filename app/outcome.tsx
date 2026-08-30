import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { PlayResult } from '@/types/game';

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceSecondary: '#1C1C26',
  surfaceElevated: '#22222E',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  textTertiary: '#5A5A72',
  primary: '#FF4444',
  primaryMuted: 'rgba(255, 68, 68, 0.12)',
  accent: '#FF8C00',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  border: 'rgba(255, 255, 255, 0.06)',
  divider: 'rgba(255, 255, 255, 0.04)',
};

export default function OutcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    result: string;
    scenario_title: string;
    day_number: string;
    chosen_items: string;
  }>();

  const result: PlayResult = params.result ? JSON.parse(params.result) : null;
  const scenarioTitle = params.scenario_title ?? 'Unknown Scenario';
  const dayNumber = params.day_number ?? '1';
  const chosenItems: string[] = params.chosen_items ? JSON.parse(params.chosen_items) : [];

  // Animations
  const emojiScale = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(20)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!result) return;
    console.log('[OutcomeScreen] Showing result:', result);
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(
        result.survival_days >= 10
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    }

    Animated.sequence([
      Animated.spring(emojiScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.parallel([
        Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(statsY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(barWidth, { toValue: result.percentile, duration: 800, useNativeDriver: false }),
      Animated.timing(actionsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    console.log('[OutcomeScreen] Share pressed');
    try {
      await Share.share({
        message: `Day ${dayNumber}: I survived ${result.survival_days} days! ${result.reaction_emoji}\nI beat ${result.percentile}% of players today.\n\nCan you do better? Play One Minute to Live 👇\n#OneMinuteToLive #SixtySecondsLeft`,
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const handleLeaderboard = () => {
    console.log('[OutcomeScreen] See leaderboard pressed');
    router.dismiss();
    router.push('/(tabs)/(leaderboard)');
  };

  const handleClose = () => {
    console.log('[OutcomeScreen] Close pressed');
    router.dismiss();
  };

  if (!result) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.textSecondary }}>No result data</Text>
      </View>
    );
  }

  const iqPositive = result.iq_delta >= 0;
  const iqColor = iqPositive ? COLORS.success : COLORS.primary;
  const iqPrefix = iqPositive ? '+' : '';
  const iqText = `${iqPrefix}${result.iq_delta} Survival IQ`;

  const barInterpolated = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const emojiRotateInterpolated = emojiRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const rankDisplay = result.total_players > 0
    ? `#${result.rank} of ${result.total_players.toLocaleString()} players`
    : 'First player today!';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Close button */}
      <Pressable
        onPress={handleClose}
        style={{ alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' }}>✕</Text>
      </Pressable>

      {/* Day label */}
      <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 }}>
        DAY {dayNumber} — {scenarioTitle.toUpperCase()}
      </Text>

      {/* Reaction emoji */}
      <Animated.View style={{ alignItems: 'center', marginBottom: 8, transform: [{ scale: emojiScale }] }}>
        <Text style={{ fontSize: 80 }}>{result.reaction_emoji}</Text>
      </Animated.View>

      {/* Survival days */}
      <Animated.View style={{ alignItems: 'center', marginBottom: 24, opacity: statsOpacity, transform: [{ translateY: statsY }] }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 4 }}>
          YOU SURVIVED
        </Text>
        <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 80, fontWeight: '700', lineHeight: 88, letterSpacing: -2 }}>
          {result.survival_days}
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 18, fontWeight: '600', marginTop: -4 }}>
          days
        </Text>
      </Animated.View>

      {/* Outcome story */}
      <Animated.View style={{ opacity: statsOpacity, transform: [{ translateY: statsY }] }}>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
            YOUR STORY
          </Text>
          <Text style={{ color: COLORS.text, fontSize: 15, lineHeight: 22 }}>
            {result.outcome_text}
          </Text>
        </View>

        {/* IQ delta */}
        <View style={{ backgroundColor: iqPositive ? COLORS.successMuted : COLORS.primaryMuted, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: iqPositive ? 'rgba(34,197,94,0.2)' : 'rgba(255,68,68,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Survival IQ change</Text>
          <Text style={{ color: iqColor, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700' }}>
            {iqText}
          </Text>
        </View>

        {/* Percentile */}
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>You beat</Text>
            <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700' }}>
              {result.percentile}%
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: COLORS.surfaceSecondary, borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View
              style={{
                height: '100%',
                width: barInterpolated,
                backgroundColor: result.percentile >= 70 ? COLORS.success : result.percentile >= 40 ? COLORS.accent : COLORS.primary,
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 8 }}>
            of players today
          </Text>
        </View>

        {/* Rank */}
        <View style={{ backgroundColor: COLORS.surfaceSecondary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Global rank</Text>
          <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '700' }}>
            {rankDisplay}
          </Text>
        </View>

        {/* Items used */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {chosenItems.map((item) => (
            <View key={item} style={{ backgroundColor: COLORS.surfaceElevated, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' }}>{item}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View style={{ opacity: actionsOpacity, gap: 12 }}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => ({
            backgroundColor: COLORS.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.35)',
          })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Share My Result</Text>
        </Pressable>

        <Pressable
          onPress={handleLeaderboard}
          style={({ pressed }) => ({
            backgroundColor: COLORS.surfaceElevated,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            borderWidth: 1,
            borderColor: COLORS.border,
          })}
        >
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>See Leaderboard</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
