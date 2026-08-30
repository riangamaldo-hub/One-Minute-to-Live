import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, Animated, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import ChibiAvatar from '@/components/ChibiAvatar';

const LOGO = require('@/assets/images/9d133403-fd40-4eab-b324-e93d60f637fa.jpeg');

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceSecondary: '#1C1C26',
  surfaceElevated: '#22222E',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  textTertiary: '#5A5A72',
  primary: '#FF4444',
  primaryMuted: 'rgba(255,68,68,0.12)',
  lime: '#A8E63D',
  limeMuted: 'rgba(168,230,61,0.12)',
  accent: '#FF8C00',
  border: 'rgba(255,255,255,0.06)',
};

const MENU_ITEMS = [
  {
    id: 'play',
    emoji: '🎮',
    title: "TODAY'S GAME",
    subtitle: 'New scenario available',
    accent: COLORS.lime,
    accentMuted: COLORS.limeMuted,
    prominent: true,
  },
  {
    id: 'leaderboard',
    emoji: '🏆',
    title: 'LEADERBOARD',
    subtitle: 'See how you rank today',
    accent: COLORS.accent,
    accentMuted: 'rgba(255,140,0,0.12)',
    prominent: false,
  },
  {
    id: 'marketplace',
    emoji: '🛒',
    title: 'MARKETPLACE',
    subtitle: 'Scenario packs · Cosmetics · Retries',
    accent: COLORS.primary,
    accentMuted: COLORS.primaryMuted,
    prominent: false,
    comingSoon: true,
  },
  {
    id: 'options',
    emoji: '⚙️',
    title: 'OPTIONS',
    subtitle: 'Sound · Music · Account',
    accent: COLORS.textSecondary,
    accentMuted: 'rgba(144,144,168,0.12)',
    prominent: false,
  },
];

function MenuCard({
  item,
  onPress,
  delay,
}: {
  item: typeof MENU_ITEMS[0];
  onPress: () => void;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: pressed ? COLORS.surfaceSecondary : COLORS.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: item.prominent ? item.accent : COLORS.border,
          borderLeftWidth: 4,
          borderLeftColor: item.accent,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 12,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: item.accentMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <Text style={{
              color: item.prominent ? item.accent : COLORS.text,
              fontSize: 16,
              fontFamily: 'SpaceMono',
              fontWeight: '700',
              letterSpacing: 0.5,
            }}>
              {item.title}
            </Text>
            {item.comingSoon ? (
              <View style={{ backgroundColor: COLORS.primaryMuted, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: COLORS.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>SOON</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{item.subtitle}</Text>
        </View>

        <Text style={{ color: COLORS.textTertiary, fontSize: 18 }}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { displayName, survivalIQ, avatarData } = useGame();

  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
  }, []);

  const handleMenuPress = (id: string) => {
    console.log('[Menu] Menu item pressed:', id);
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'play':
        router.push('/(tabs)/(play)');
        break;
      case 'leaderboard':
        router.push('/(tabs)/(leaderboard)');
        break;
      case 'marketplace':
        Alert.alert('Coming Soon', 'The Marketplace is under construction. Check back soon!');
        break;
      case 'options':
        router.push('/options');
        break;
    }
  };

  const playerName = displayName ?? 'Survivor';
  const iqDisplay = String(survivalIQ);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
      {/* Logo */}
      <Animated.View style={{ alignItems: 'center', marginBottom: 16, opacity: logoAnim, transform: [{ scale: logoAnim }] }}>
        <Image source={LOGO} style={{ width: 200, height: 200, borderRadius: 20 }} resizeMode="cover" />
      </Animated.View>

      {/* Player info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
        {avatarData ? (
          <ChibiAvatar avatarData={avatarData} size={60} />
        ) : (
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>🧑</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800' }}>{playerName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Survival IQ:</Text>
            <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '700' }}>{iqDisplay}</Text>
          </View>
        </View>
      </View>

      {/* Menu items */}
      <View style={{ flex: 1 }}>
        {MENU_ITEMS.map((item, i) => (
          <MenuCard
            key={item.id}
            item={item}
            onPress={() => handleMenuPress(item.id)}
            delay={i * 80}
          />
        ))}
      </View>
    </View>
  );
}
