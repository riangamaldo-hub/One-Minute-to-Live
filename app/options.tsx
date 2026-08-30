import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceSecondary: '#1C1C26',
  text: '#F0F0F8',
  textSecondary: '#9090A8',
  textTertiary: '#5A5A72',
  lime: '#A8E63D',
  primary: '#FF4444',
  border: 'rgba(255,255,255,0.06)',
};

const KEYS = {
  MUSIC: '@sixty_seconds/music_enabled',
  SFX: '@sixty_seconds/sfx_enabled',
};

export default function OptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [music, sfx] = await Promise.all([
        AsyncStorage.getItem(KEYS.MUSIC),
        AsyncStorage.getItem(KEYS.SFX),
      ]);
      setMusicEnabled(music !== 'false');
      setSfxEnabled(sfx !== 'false');
    };
    load();
  }, []);

  const toggleMusic = async (val: boolean) => {
    console.log('[Options] Music toggled:', val);
    setMusicEnabled(val);
    await AsyncStorage.setItem(KEYS.MUSIC, String(val));
  };

  const toggleSfx = async (val: boolean) => {
    console.log('[Options] SFX toggled:', val);
    setSfxEnabled(val);
    await AsyncStorage.setItem(KEYS.SFX, String(val));
  };

  const handleGoogleSignIn = () => {
    console.log('[Options] Sign in with Google pressed');
    Alert.alert('Coming Soon', 'Google sign-in will be available in a future update.');
  };

  const handleFacebookSignIn = () => {
    console.log('[Options] Sign in with Facebook pressed');
    Alert.alert('Coming Soon', 'Facebook sign-in will be available in a future update.');
  };

  const handleRateApp = () => {
    console.log('[Options] Rate the App pressed');
    Alert.alert('Rate the App', 'Thank you for your support! Rating will open the App Store.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => {
            console.log('[Options] Back pressed');
            router.back();
          }}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}>‹</Text>
        </Pressable>
        <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700', letterSpacing: 1 }}>
          OPTIONS
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        {/* Audio Section */}
        <Text style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginTop: 8 }}>
          AUDIO
        </Text>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>Music</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>Background music</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={toggleMusic}
              trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.lime }}
              thumbColor="#fff"
            />
          </View>
          <View style={{ height: 1, backgroundColor: COLORS.border }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <View>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>Sound Effects</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>Button taps, alerts</Text>
            </View>
            <Switch
              value={sfxEnabled}
              onValueChange={toggleSfx}
              trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.lime }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          ACCOUNT
        </Text>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 24 }}>
          <Pressable
            onPress={handleGoogleSignIn}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 22 }}>🔵</Text>
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', flex: 1 }}>Sign in with Google</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>Coming Soon</Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: COLORS.border }} />
          <Pressable
            onPress={handleFacebookSignIn}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 22 }}>🔷</Text>
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', flex: 1 }}>Sign in with Facebook</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>Coming Soon</Text>
          </Pressable>
        </View>

        {/* About Section */}
        <Text style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          ABOUT
        </Text>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>Version</Text>
            <Text style={{ color: COLORS.textSecondary, fontFamily: 'SpaceMono', fontSize: 13 }}>1.0.0</Text>
          </View>
          <View style={{ height: 1, backgroundColor: COLORS.border }} />
          <Pressable
            onPress={handleRateApp}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>Rate the App</Text>
            <Text style={{ color: COLORS.lime, fontSize: 15 }}>⭐</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
