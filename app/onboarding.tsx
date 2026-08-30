import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  border: 'rgba(255, 255, 255, 0.06)',
};

const SLIDES = [
  {
    emoji: '💀',
    title: 'One scenario.\n60 seconds.\nPick 3 items.',
    subtitle: 'Every day, a new survival crisis. You have one minute to grab exactly 3 items before it\'s too late.',
    accent: COLORS.primary,
    items: null,
  },
  {
    emoji: '🎯',
    title: 'Your choices\ndetermine\nyour fate.',
    subtitle: 'Each combination of items leads to a different darkly funny outcome. Some combos are genius. Some are... not.',
    accent: COLORS.accent,
    items: [
      { emoji: '🔪', name: 'Swiss Army Knife' },
      { emoji: '💧', name: 'Water Purifier' },
      { emoji: '📡', name: 'Satellite Phone' },
    ],
  },
  {
    emoji: '🏆',
    title: 'Compete\nwith the\nworld.',
    subtitle: 'Everyone faces the same scenario. See how your survival instincts stack up against players worldwide.',
    accent: COLORS.success,
    items: null,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setOnboardingComplete } = useGame();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goToSlide = (index: number) => {
    console.log('[Onboarding] Going to slide:', index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentSlide(index);
    Animated.timing(progressAnim, {
      toValue: index / (SLIDES.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    console.log('[Onboarding] Next pressed, current slide:', currentSlide);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    console.log('[Onboarding] Finishing onboarding');
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setOnboardingComplete();
    router.replace('/paywall');
  };

  const isLast = currentSlide === SLIDES.length - 1;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['33%', '100%'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{
              width: SCREEN_WIDTH,
              flex: 1,
              paddingTop: insets.top + 40,
              paddingHorizontal: 32,
              paddingBottom: 40,
              justifyContent: 'space-between',
            }}
          >
            {/* Top section */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 80, marginBottom: 32, textAlign: 'center' }}>{slide.emoji}</Text>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 40,
                  fontWeight: '900',
                  letterSpacing: -1,
                  lineHeight: 46,
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                {slide.title}
              </Text>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 16,
                  lineHeight: 24,
                  textAlign: 'center',
                }}
              >
                {slide.subtitle}
              </Text>

              {slide.items && (
                <View style={{ marginTop: 32, gap: 10 }}>
                  {slide.items.map((item) => (
                    <View
                      key={item.name}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        backgroundColor: COLORS.surface,
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 32, gap: 24 }}>
        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: COLORS.surfaceSecondary, borderRadius: 2, overflow: 'hidden' }}>
          <Animated.View
            style={{
              height: '100%',
              width: progressWidth,
              backgroundColor: SLIDES[currentSlide].accent,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => goToSlide(i)}
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === currentSlide ? SLIDES[currentSlide].accent : COLORS.surfaceSecondary,
              }}
            />
          ))}
        </View>

        {/* CTA button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: SLIDES[currentSlide].accent,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            boxShadow: `0 4px 20px ${SLIDES[currentSlide].accent}60`,
          })}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>
            {isLast ? "Let's Play" : 'Next'}
          </Text>
        </Pressable>

        {!isLast && (
          <Pressable
            onPress={handleFinish}
            style={({ pressed }) => ({ alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>Skip intro</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
