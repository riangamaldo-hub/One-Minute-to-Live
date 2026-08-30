import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getTodayScenario, submitPlay } from '@/lib/api';
import { useGame } from '@/contexts/GameContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import type { ScenarioItem, TodayScenarioResponse } from '@/types/game';

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
  accentMuted: 'rgba(255, 140, 0, 0.12)',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  border: 'rgba(255, 255, 255, 0.06)',
  divider: 'rgba(255, 255, 255, 0.04)',
  lime: '#A8E63D',
  limeMuted: 'rgba(168, 230, 61, 0.12)',
};

function SkeletonLine({ width, height = 14 }: { width: number | `${number}%`; height?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: COLORS.surfaceSecondary,
        opacity,
      }}
    />
  );
}

function ItemCard({
  item,
  selected,
  onPress,
  index,
  gameStarted,
}: {
  item: ScenarioItem;
  selected: boolean;
  onPress: () => void;
  index: number;
  gameStarted: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (gameStarted) {
      Animated.parallel([
        Animated.timing(entranceOpacity, {
          toValue: 1,
          duration: 350,
          delay: index * 70,
          useNativeDriver: true,
        }),
        Animated.timing(entranceY, {
          toValue: 0,
          duration: 350,
          delay: index * 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: gameStarted ? entranceOpacity : 1,
        transform: [{ translateY: gameStarted ? entranceY : 0 }, { scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: selected ? COLORS.primaryMuted : COLORS.surface,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: selected ? COLORS.primary : COLORS.border,
          padding: 16,
          minHeight: 120,
          justifyContent: 'space-between',
        }}
      >
        {selected && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
          </View>
        )}
        <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
        <View style={{ gap: 4 }}>
          <Text
            style={{
              color: selected ? COLORS.text : COLORS.text,
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{ color: COLORS.textSecondary, fontSize: 11, lineHeight: 15 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId, displayName, avatarEmoji, setLastPlayedDate, onboardingComplete, isLoading: gameLoading } = useGame();
  const { isSubscribed } = useSubscription();

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!gameLoading && !onboardingComplete) {
      console.log('[PlayScreen] Onboarding not complete, redirecting');
      router.replace('/onboarding');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameLoading, onboardingComplete]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarioData, setScenarioData] = useState<TodayScenarioResponse | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerPulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loadScenario();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadScenario = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[PlayScreen] Loading scenario for userId:', userId);
      const data = await getTodayScenario(userId ?? undefined);
      setScenarioData(data);
      setTimeLeft(data.scenario.timer_seconds);
    } catch (err) {
      console.error('[PlayScreen] Failed to load scenario:', err);
      setError('Could not load today\'s scenario. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    console.log('[PlayScreen] Game started');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setGameStarted(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimerExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft <= 10 && gameStarted && timeLeft > 0) {
      if (!pulseLoop.current) {
        pulseLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(timerPulse, { toValue: 1.06, duration: 400, useNativeDriver: true }),
            Animated.timing(timerPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
          ])
        );
        pulseLoop.current.start();
      }
    } else if (timeLeft > 10) {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
      timerPulse.setValue(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameStarted]);

  const handleTimerExpire = useCallback(() => {
    console.log('[PlayScreen] Timer expired, selected items:', selectedItems);
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    if (selectedItems.length > 0) {
      doSubmit(selectedItems);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  const handleItemPress = (itemId: string) => {
    console.log('[PlayScreen] Item pressed:', itemId, 'currently selected:', selectedItems);
    if (selectedItems.includes(itemId)) {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } else if (selectedItems.length >= 3) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    } else {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setSelectedItems(prev => [...prev, itemId]);
    }
  };

  const handleSubmit = () => {
    console.log('[PlayScreen] Submit pressed with items:', selectedItems);
    if (selectedItems.length !== 3) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    clearInterval(timerRef.current!);
    doSubmit(selectedItems);
  };

  const doSubmit = async (items: string[]) => {
    if (submitting || !scenarioData) return;
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    console.log('[PlayScreen] Submitting play:', { items, timeTaken, userId });
    try {
      const result = await submitPlay({
        scenario_id: scenarioData.scenario.id,
        chosen_items: items,
        time_taken_seconds: timeTaken,
        user_id: userId ?? undefined,
        display_name: displayName ?? 'Survivor',
        avatar_emoji: avatarEmoji,
      });
      const today = new Date().toISOString().split('T')[0];
      await setLastPlayedDate(today);
      console.log('[PlayScreen] Submit success, navigating to outcome');
      router.push({
        pathname: '/outcome',
        params: {
          result: JSON.stringify(result.result),
          scenario_title: scenarioData.scenario.title,
          day_number: String(scenarioData.scenario.day_number),
          chosen_items: JSON.stringify(items),
        },
      });
    } catch (err) {
      console.error('[PlayScreen] Submit failed:', err);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const timerColor =
    timeLeft <= 10 ? COLORS.primary : timeLeft <= 20 ? COLORS.accent : COLORS.text;

  const timerMinutes = Math.floor(timeLeft / 60);
  const timerSeconds = timeLeft % 60;
  const timerDisplay = `${timerMinutes}:${String(timerSeconds).padStart(2, '0')}`;

  const paddingBottom = 120 + insets.bottom;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
        <SkeletonLine width={80} height={18} />
        <View style={{ height: 16 }} />
        <SkeletonLine width={'70%'} height={32} />
        <View style={{ height: 12 }} />
        <SkeletonLine width={'90%'} height={16} />
        <SkeletonLine width={'60%'} height={16} />
        <View style={{ height: 40 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, height: 120 }} />
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, height: 120 }} />
        </View>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, height: 120 }} />
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, height: 120 }} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💀</Text>
        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Couldn't load today's scenario
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
          {error}
        </Text>
        <Pressable
          onPress={loadScenario}
          style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!scenarioData) return null;

  const { scenario, already_played, user_result } = scenarioData;

  // Already played state
  if (already_played && user_result) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursLeft = Math.ceil((tomorrow.getTime() - Date.now()) / 3600000);
    const outcomeText = user_result.outcome_rules?.outcome_text ?? 'You survived!';
    const reactionEmoji = user_result.outcome_rules?.reaction_emoji ?? '🏆';

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={{ color: COLORS.primary, fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
          DAY {scenario.day_number}
        </Text>
        <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 24 }}>
          {scenario.title}
        </Text>

        <View style={{ backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{reactionEmoji}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 4 }}>
            YOU SURVIVED
          </Text>
          <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 48, fontWeight: '700', marginBottom: 16 }}>
            {user_result.survival_days}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 }}>days</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            {outcomeText}
          </Text>
        </View>

        <View style={{ backgroundColor: COLORS.surfaceSecondary, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 4 }}>Next scenario in</Text>
          <Text style={{ color: COLORS.accent, fontFamily: 'SpaceMono', fontSize: 28, fontWeight: '700' }}>
            {hoursLeft}h
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 4 }}>Come back tomorrow!</Text>
        </View>

        {/* Retry button — pro gated */}
        {isSubscribed ? (
          <Pressable
            onPress={() => {
              console.log('[PlayScreen] Pro retry pressed');
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              // Reset state for a fresh attempt
              setSelectedItems([]);
              setTimeLeft(scenarioData?.scenario.timer_seconds ?? 60);
              setGameStarted(false);
              setSubmitting(false);
              setScenarioData(prev => prev ? { ...prev, already_played: false, user_result: null } : prev);
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(168,230,61,0.18)' : COLORS.limeMuted,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: COLORS.lime,
              marginBottom: 12,
            })}
          >
            <Text style={{ color: COLORS.lime, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 }}>
              ⚡ Retry — Pro Perk
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              console.log('[PlayScreen] Free retry prompt pressed — showing upgrade prompt');
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert(
                '⚡ Extra Retries',
                'Pro subscribers get unlimited retries. Upgrade to keep surviving!',
                [
                  { text: 'Maybe Later', style: 'cancel' },
                  {
                    text: 'Upgrade to Pro',
                    onPress: () => {
                      console.log('[PlayScreen] Upgrade to Pro pressed from retry prompt');
                      router.push('/paywall');
                    },
                  },
                ]
              );
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? COLORS.surfaceElevated : COLORS.surfaceSecondary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 12,
            })}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' }}>
              🔒 Retry (Pro Only)
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 3 }}>
              Upgrade to unlock extra retries
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            console.log('[PlayScreen] See leaderboard pressed');
            router.push('/(tabs)/(leaderboard)');
          }}
          style={{ backgroundColor: COLORS.surfaceElevated, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}
        >
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>See Today's Leaderboard</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Pre-game state
  if (!gameStarted) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={{ color: COLORS.primary, fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
          DAY {scenario.day_number}
        </Text>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12, lineHeight: 36 }}>
            {scenario.title}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16, lineHeight: 24 }}>
            {scenario.flavor_text}
          </Text>
        </View>

        <View style={{ backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 32, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accentMuted, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>⏱️</Text>
            </View>
            <View>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700' }}>60 seconds</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>to pick your 3 items</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: COLORS.divider }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryMuted, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </View>
            <View>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700' }}>Pick exactly 3</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>your combo determines your fate</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: COLORS.divider }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.successMuted, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🌍</Text>
            </View>
            <View>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700' }}>Compete globally</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>same scenario for everyone today</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={startGame}
          style={({ pressed }) => ({
            backgroundColor: COLORS.primary,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            boxShadow: '0 4px 20px rgba(255, 68, 68, 0.4)',
          })}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>
            START — 60 SECONDS
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  // In-game state
  const items: ScenarioItem[] = scenario.item_options;
  const canSubmit = selectedItems.length === 3;
  const selectedCount = selectedItems.length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Timer header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 1 }}>
            {scenario.title.toUpperCase()}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
            {selectedCount}/3 selected
          </Text>
        </View>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: timerPulse }] }}>
          <Text
            style={{
              fontFamily: 'SpaceMono',
              fontSize: 72,
              fontWeight: '700',
              color: timerColor,
              letterSpacing: -2,
              lineHeight: 80,
            }}
          >
            {timerDisplay}
          </Text>
        </Animated.View>
        {/* Timer bar */}
        <View style={{ height: 4, backgroundColor: COLORS.surfaceSecondary, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${(timeLeft / scenario.timer_seconds) * 100}%`,
              backgroundColor: timerColor,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
          {scenario.flavor_text}
        </Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {items.map((item, index) => (
              <View key={item.id} style={{ width: '47%' }}>
                <ItemCard
                  item={item}
                  selected={selectedItems.includes(item.id)}
                  onPress={() => handleItemPress(item.id)}
                  index={index}
                  gameStarted={gameStarted}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Submit button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          paddingTop: 12,
          backgroundColor: 'transparent',
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          style={({ pressed }) => ({
            backgroundColor: canSubmit ? COLORS.primary : COLORS.surfaceSecondary,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: pressed ? 0.85 : canSubmit ? 1 : 0.5,
            boxShadow: canSubmit ? '0 4px 20px rgba(255, 68, 68, 0.4)' : undefined,
          })}
        >
          <Text
            style={{
              color: canSubmit ? '#fff' : COLORS.textTertiary,
              fontSize: 17,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}
          >
            {submitting ? 'Submitting...' : canSubmit ? 'SUBMIT — SEAL MY FATE' : `Pick ${3 - selectedCount} more item${3 - selectedCount !== 1 ? 's' : ''}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
