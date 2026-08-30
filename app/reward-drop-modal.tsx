import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RewardDropItem } from '@/types/game';

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceSecondary: '#1C1C26',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  textTertiary: '#5A5A72',
  lime: '#A8E63D',
  gold: '#FFD700',
  border: 'rgba(255,255,255,0.06)',
};

const RARITY_BG: Record<string, string> = {
  legendary: 'rgba(255,215,0,0.15)',
  rare: 'rgba(68,136,255,0.15)',
  uncommon: 'rgba(34,197,94,0.15)',
  regular: 'rgba(144,144,168,0.15)',
};

const RARITY_COLOR: Record<string, string> = {
  legendary: '#FFD700',
  rare: '#4488FF',
  uncommon: '#22C55E',
  regular: '#9090A8',
};

function Particle({ index }: { index: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 150;
    const startX = (Math.random() - 0.5) * 300;
    const startY = Math.random() * -200 - 50;

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.8, duration: 400, useNativeDriver: true }),
          Animated.timing(y, { toValue: startY, duration: 2000, useNativeDriver: true }),
          Animated.timing(x, { toValue: startX, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size = 6 + (index % 3) * 3;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.gold,
        opacity,
        transform: [{ translateX: x }, { translateY: y }],
        top: '50%',
        left: '50%',
      }}
    />
  );
}

export default function RewardDropModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ items?: string; percentile?: string }>();

  const items: RewardDropItem[] = params.items ? JSON.parse(params.items) : [];
  const percentile = params.percentile ? Number(params.percentile) : 0;

  const titleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[RewardDropModal] Showing reward drop, items:', items.length, 'percentile:', percentile);
    Animated.sequence([
      Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAwesome = () => {
    console.log('[RewardDropModal] Awesome button pressed');
    router.back();
  };

  const percentileDisplay = String(percentile);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Particles */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <Particle key={i} index={i} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 32, paddingHorizontal: 24, paddingBottom: insets.bottom + 40, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View style={{ transform: [{ scale: titleScale }], alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: COLORS.gold, fontFamily: 'SpaceMono', fontSize: 32, fontWeight: '700', textAlign: 'center' }}>
            🎁 REWARD DROP!
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={{ opacity: contentOpacity, alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
            You beat
          </Text>
          <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 22, fontWeight: '700' }}>
            {percentileDisplay}%
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
            of players today
          </Text>
        </Animated.View>

        {/* Items or empty state */}
        <Animated.View style={{ opacity: contentOpacity, width: '100%', gap: 12, marginBottom: 32 }}>
          {items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>😢</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 16, textAlign: 'center' }}>
                No drop this time... keep playing!
              </Text>
            </View>
          ) : (
            items.map(item => {
              const rarityBg = RARITY_BG[item.rarity] ?? RARITY_BG.regular;
              const rarityColor = RARITY_COLOR[item.rarity] ?? RARITY_COLOR.regular;
              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1.5,
                    borderColor: rarityColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: rarityBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 36 }}>{item.preview_emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <View style={{ backgroundColor: rarityBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
                      <Text style={{ color: rarityColor, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.rarity}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Animated.View>

        {/* Awesome button */}
        <Animated.View style={{ opacity: contentOpacity, width: '100%' }}>
          <Pressable
            onPress={handleAwesome}
            style={({ pressed }) => ({
              backgroundColor: COLORS.lime,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#0A0A0F', fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '700' }}>
              AWESOME!
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
