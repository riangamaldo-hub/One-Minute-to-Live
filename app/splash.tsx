import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';

const LOGO = require('@/assets/images/9d133403-fd40-4eab-b324-e93d60f637fa.jpeg');

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { avatarBuilderComplete, isLoading } = useGame();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const navigated = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = () => {
    if (navigated.current || isLoading) return;
    navigated.current = true;
    console.log('[Splash] Navigating, avatarBuilderComplete:', avatarBuilderComplete);
    if (avatarBuilderComplete) {
      router.replace('/menu');
    } else {
      router.replace('/avatar-builder');
    }
  };

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      navigate();
    }, 2500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, avatarBuilderComplete]);

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center', paddingBottom: insets.bottom }}
      onPress={() => {
        console.log('[Splash] Tapped to continue');
        navigate();
      }}
    >
      <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
        <Image
          source={LOGO}
          style={{ width: 280, height: 280, borderRadius: 24 }}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.Text
        style={{
          marginTop: 48,
          fontFamily: 'SpaceMono',
          fontSize: 14,
          color: '#A8E63D',
          letterSpacing: 3,
          opacity: Animated.multiply(textOpacity, pulseAnim),
        }}
      >
        TAP TO CONTINUE
      </Animated.Text>
    </Pressable>
  );
}
