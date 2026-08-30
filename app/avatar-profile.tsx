import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/lib/supabase';
import ChibiAvatar from '@/components/ChibiAvatar';
import type { AvatarData } from '@/types/game';

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
  primary: '#FF4444',
};

interface ProfileUser {
  id: string;
  display_name: string;
  avatar_emoji: string;
  survival_iq: number;
  streak_count: number;
  total_plays?: number;
  best_survival_days?: number;
  avatar_data?: AvatarData | null;
}

export default function AvatarProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    user_id?: string;
    display_name?: string;
    survival_iq?: string;
    view_only?: string;
  }>();

  const {
    userId: currentUserId,
    displayName: currentDisplayName,
    avatarEmoji: currentAvatarEmoji,
    survivalIQ: currentSurvivalIQ,
    streakCount: currentStreakCount,
    avatarData: currentAvatarData,
  } = useGame();

  const viewOnly = params.view_only === 'true';
  const targetUserId = params.user_id ?? currentUserId;

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [avgDays, setAvgDays] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) return;
    console.log('[AvatarProfile] Loading profile for userId:', targetUserId, 'viewOnly:', viewOnly);
    loadProfile(targetUserId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  const loadProfile = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, playsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', uid).single(),
        supabase.from('play_results').select('survival_days').eq('user_id', uid),
      ]);

      console.log('[AvatarProfile] User fetch result:', userRes.error ? userRes.error.message : 'ok');
      console.log('[AvatarProfile] Plays fetch result:', playsRes.error ? playsRes.error.message : `${playsRes.data?.length ?? 0} plays`);

      if (userRes.error) throw userRes.error;

      const userData = userRes.data as ProfileUser;
      setProfileUser(userData);

      if (playsRes.data && playsRes.data.length > 0) {
        const total = playsRes.data.reduce((sum: number, r: { survival_days: number }) => sum + (r.survival_days ?? 0), 0);
        setAvgDays(Math.round(total / playsRes.data.length));
      }
    } catch (err) {
      console.error('[AvatarProfile] Failed to load profile:', err);
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = () => {
    console.log('[AvatarProfile] Customize Avatar pressed');
    router.push('/avatar-customize');
  };

  const handleBack = () => {
    console.log('[AvatarProfile] Back pressed');
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.lime} size="large" />
      </View>
    );
  }

  if (error || !profileUser) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>😵</Text>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Profile not found
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          {error ?? 'This player profile could not be loaded.'}
        </Text>
        <Pressable
          onPress={handleBack}
          style={{ backgroundColor: COLORS.lime, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }}
        >
          <Text style={{ color: '#0A0A0F', fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const displayName = profileUser.display_name ?? currentDisplayName ?? 'Survivor';
  const survivalIQ = profileUser.survival_iq ?? currentSurvivalIQ;
  const streakCount = profileUser.streak_count ?? currentStreakCount;
  const totalPlays = profileUser.total_plays ?? 0;
  const bestSurvival = profileUser.best_survival_days ?? 0;
  const avatarData = profileUser.avatar_data ?? currentAvatarData;
  const avatarEmoji = profileUser.avatar_emoji ?? currentAvatarEmoji;

  const pointsToCatch = viewOnly ? (survivalIQ - currentSurvivalIQ) : 0;
  const isAhead = pointsToCatch > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Back button */}
      <Pressable
        onPress={handleBack}
        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}>←</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' }}>Back</Text>
      </Pressable>

      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {avatarData ? (
          <ChibiAvatar avatarData={avatarData} size={200} />
        ) : (
          <View style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontSize: 80 }}>{avatarEmoji}</Text>
          </View>
        )}
      </View>

      {/* Display name */}
      <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
        {displayName}
      </Text>

      {/* Survival IQ badge */}
      <View style={{ alignSelf: 'center', backgroundColor: COLORS.surface, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.lime, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>SURVIVAL IQ</Text>
        <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 22, fontWeight: '700' }}>{survivalIQ}</Text>
      </View>

      {/* Streak row */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>🔥</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Current Streak</Text>
        </View>
        <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700' }}>
          {streakCount}
        </Text>
      </View>

      {/* Rank card */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>🏆</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Global Rank</Text>
        </View>
        <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700' }}>
          #{survivalIQ}
        </Text>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700' }}>{totalPlays}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' }}>Total Plays</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700' }}>{bestSurvival}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' }}>Best Survival</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
          <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 20, fontWeight: '700' }}>{avgDays}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' }}>Avg Days</Text>
        </View>
      </View>

      {/* View-only: points to catch */}
      {viewOnly && isAhead && (
        <View style={{ backgroundColor: COLORS.surfaceSecondary, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ color: COLORS.gold, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
            {pointsToCatch} IQ points ahead of you
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 4 }}>Keep playing to catch up!</Text>
        </View>
      )}

      {/* Customize button (own profile only) */}
      {!viewOnly && (
        <Pressable
          onPress={handleCustomize}
          style={({ pressed }) => ({
            backgroundColor: COLORS.lime,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#0A0A0F', fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '700' }}>
            CUSTOMIZE AVATAR
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
