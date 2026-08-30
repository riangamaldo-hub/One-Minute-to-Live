import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLeaderboard } from '@/lib/api';
import { useGame } from '@/contexts/GameContext';
import type { LeaderboardEntry } from '@/types/game';

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
  warning: '#F59E0B',
  border: 'rgba(255, 255, 255, 0.06)',
  divider: 'rgba(255, 255, 255, 0.04)',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

function SkeletonRow() {
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
    <Animated.View style={{ opacity, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceSecondary }} />
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ width: '50%', height: 14, borderRadius: 7, backgroundColor: COLORS.surfaceSecondary }} />
        <View style={{ width: '30%', height: 11, borderRadius: 5, backgroundColor: COLORS.surfaceSecondary }} />
      </View>
      <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: COLORS.surfaceSecondary }} />
    </Animated.View>
  );
}

function AnimatedRow({ entry, index, isCurrentUser }: { entry: LeaderboardEntry; index: number; isCurrentUser: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 50, useNativeDriver: true }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rankColor = entry.rank === 1 ? COLORS.gold : entry.rank === 2 ? COLORS.silver : entry.rank === 3 ? COLORS.bronze : COLORS.textTertiary;
  const rankBg = entry.rank === 1 ? 'rgba(255,215,0,0.12)' : entry.rank === 2 ? 'rgba(192,192,192,0.12)' : entry.rank === 3 ? 'rgba(205,127,50,0.12)' : COLORS.surfaceSecondary;
  const rankEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

  const minutes = Math.floor(entry.time_taken_seconds / 60);
  const seconds = entry.time_taken_seconds % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: isCurrentUser ? COLORS.primaryMuted : 'transparent',
          borderLeftWidth: isCurrentUser ? 3 : 0,
          borderLeftColor: COLORS.primary,
          gap: 12,
        }}
      >
        {/* Rank */}
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: rankBg, alignItems: 'center', justifyContent: 'center' }}>
          {rankEmoji ? (
            <Text style={{ fontSize: 18 }}>{rankEmoji}</Text>
          ) : (
            <Text style={{ color: rankColor, fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '700' }}>
              {entry.rank}
            </Text>
          )}
        </View>

        {/* Avatar */}
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 22 }}>{entry.avatar_emoji}</Text>
        </View>

        {/* Name + items */}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
              {entry.display_name}
            </Text>
            {isCurrentUser && (
              <View style={{ backgroundColor: COLORS.primaryMuted, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={{ color: COLORS.textTertiary, fontSize: 11 }}>
            {entry.chosen_items.join(' · ')}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '700' }}>
            {entry.survival_days}d
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontSize: 11 }}>{timeDisplay}</Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: COLORS.divider, marginHorizontal: 20 }} />
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useGame();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[LeaderboardScreen] Loading leaderboard for userId:', userId);
      const data = await getLeaderboard(userId ?? undefined);
      setEntries(data.leaderboard);
      setTotalPlayers(data.total_players);
      setUserRank(data.user_rank);
      console.log('[LeaderboardScreen] Loaded', data.leaderboard.length, 'entries, total:', data.total_players);
    } catch (err) {
      console.error('[LeaderboardScreen] Failed to load leaderboard:', err);
      setError('Could not load the leaderboard. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const totalPlayersDisplay = totalPlayers > 1000
    ? `${(totalPlayers / 1000).toFixed(1)}k`
    : String(totalPlayers);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 }}>
              TODAY'S SURVIVORS
            </Text>
            <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
              Leaderboard
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 22, fontWeight: '700' }}>
              {totalPlayersDisplay}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>players today</Text>
          </View>
        </View>

        {userRank && (
          <View style={{ marginTop: 16, backgroundColor: COLORS.primaryMuted, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,68,68,0.2)' }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Your rank today</Text>
            <Text style={{ color: COLORS.primary, fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700' }}>
              #{userRank}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View>
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            Couldn't load leaderboard
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {error}
          </Text>
          <Pressable
            onPress={() => {
              console.log('[LeaderboardScreen] Retry pressed');
              loadLeaderboard();
            }}
            style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Try Again</Text>
          </Pressable>
        </View>
      ) : entries.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🏆</Text>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            No survivors yet
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
            Be the first to play today's scenario and claim the top spot!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.rank)}
          renderItem={({ item, index }) => (
            <AnimatedRow
              entry={item}
              index={index}
              isCurrentUser={!!(userId && item.rank === userRank)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
