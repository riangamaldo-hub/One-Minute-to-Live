import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { upsertUser } from '@/lib/api';
import type { AvatarData } from '@/types/game';

const STORAGE_KEYS = {
  USER_ID: '@sixty_seconds/user_id',
  DISPLAY_NAME: '@sixty_seconds/display_name',
  AVATAR_EMOJI: '@sixty_seconds/avatar_emoji',
  ONBOARDING_COMPLETE: '@sixty_seconds/onboarding_complete',
  LAST_PLAYED_DATE: '@sixty_seconds/last_played_date',
  IS_GUEST: '@sixty_seconds/is_guest',
  AVATAR_BUILDER_COMPLETE: '@sixty_seconds/avatar_builder_complete',
  AVATAR_DATA: '@sixty_seconds/avatar_data',
};

function generateGuestId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface GameState {
  userId: string | null;
  displayName: string | null;
  avatarEmoji: string;
  survivalIQ: number;
  streakCount: number;
  isGuest: boolean;
  onboardingComplete: boolean;
  lastPlayedDate: string | null;
  isLoading: boolean;
  avatarBuilderComplete: boolean;
  avatarData: AvatarData | null;
}

interface GameContextValue extends GameState {
  setOnboardingComplete: () => Promise<void>;
  setLastPlayedDate: (date: string) => Promise<void>;
  updateUser: (displayName: string, avatarEmoji: string) => Promise<void>;
  refreshUserId: () => Promise<string>;
  setAvatarBuilderComplete: (avatarData: AvatarData) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    userId: null,
    displayName: null,
    avatarEmoji: '🧑',
    survivalIQ: 1000,
    streakCount: 0,
    isGuest: true,
    onboardingComplete: false,
    lastPlayedDate: null,
    isLoading: true,
    avatarBuilderComplete: false,
    avatarData: null,
  });

  useEffect(() => {
    loadStoredState();
  }, []);

  const loadStoredState = async () => {
    try {
      const [
        userId,
        displayName,
        avatarEmoji,
        onboardingComplete,
        lastPlayedDate,
        isGuest,
        avatarBuilderComplete,
        avatarDataRaw,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_EMOJI),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYED_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST),
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_BUILDER_COMPLETE),
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_DATA),
      ]);

      let resolvedUserId = userId;
      const resolvedIsGuest = isGuest !== 'false';

      if (!resolvedUserId) {
        resolvedUserId = generateGuestId();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, resolvedUserId);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_GUEST, 'true');
        console.log('[GameContext] Generated new guest ID:', resolvedUserId);
      } else {
        console.log('[GameContext] Loaded stored user ID:', resolvedUserId, 'isGuest:', resolvedIsGuest);
      }

      let parsedAvatarData: AvatarData | null = null;
      if (avatarDataRaw) {
        try {
          parsedAvatarData = JSON.parse(avatarDataRaw);
        } catch {
          console.warn('[GameContext] Failed to parse avatar data');
        }
      }

      setState({
        userId: resolvedUserId,
        displayName: displayName,
        avatarEmoji: avatarEmoji ?? '🧑',
        survivalIQ: 1000,
        streakCount: 0,
        isGuest: resolvedIsGuest,
        onboardingComplete: onboardingComplete === 'true',
        lastPlayedDate: lastPlayedDate,
        isLoading: false,
        avatarBuilderComplete: avatarBuilderComplete === 'true',
        avatarData: parsedAvatarData,
      });
    } catch (err) {
      console.error('[GameContext] Failed to load stored state:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setOnboardingComplete = useCallback(async () => {
    console.log('[GameContext] setOnboardingComplete');
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    setState(prev => ({ ...prev, onboardingComplete: true }));
  }, []);

  const setLastPlayedDate = useCallback(async (date: string) => {
    console.log('[GameContext] setLastPlayedDate:', date);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAYED_DATE, date);
    setState(prev => ({ ...prev, lastPlayedDate: date }));
  }, []);

  const updateUser = useCallback(async (displayName: string, avatarEmoji: string) => {
    console.log('[GameContext] updateUser:', { displayName, avatarEmoji });
    if (!state.userId) return;
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, displayName),
      AsyncStorage.setItem(STORAGE_KEYS.AVATAR_EMOJI, avatarEmoji),
    ]);
    setState(prev => ({ ...prev, displayName, avatarEmoji }));
    try {
      await upsertUser({ id: state.userId, display_name: displayName, avatar_emoji: avatarEmoji });
    } catch (err) {
      console.error('[GameContext] Failed to upsert user on server:', err);
    }
  }, [state.userId]);

  const refreshUserId = useCallback(async (): Promise<string> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (stored) return stored;
    const newId = generateGuestId();
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, newId);
    setState(prev => ({ ...prev, userId: newId }));
    return newId;
  }, []);

  const setAvatarBuilderComplete = useCallback(async (avatarData: AvatarData) => {
    console.log('[GameContext] setAvatarBuilderComplete', avatarData);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.AVATAR_BUILDER_COMPLETE, 'true'),
      AsyncStorage.setItem(STORAGE_KEYS.AVATAR_DATA, JSON.stringify(avatarData)),
    ]);
    setState(prev => ({ ...prev, avatarBuilderComplete: true, avatarData }));
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      setOnboardingComplete,
      setLastPlayedDate,
      updateUser,
      refreshUserId,
      setAvatarBuilderComplete,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { STORAGE_KEYS };
