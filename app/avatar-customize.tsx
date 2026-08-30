import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  PanResponder,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/lib/supabase';
import { upsertUser } from '@/lib/api';
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
};

const RARITY_COLORS: Record<string, string> = {
  legendary: '#FFD700',
  rare: '#4488FF',
  uncommon: '#22C55E',
  regular: '#9090A8',
};

const PART_TABS = [
  { key: 'hair', label: '💇', title: 'Hair' },
  { key: 'eyes', label: '👁️', title: 'Eyes' },
  { key: 'mouth', label: '👄', title: 'Mouth' },
  { key: 'eyebrows', label: '🤨', title: 'Brows' },
  { key: 'facialhair', label: '✨', title: 'Lashes' },
  { key: 'shirt', label: '👕', title: 'Shirt' },
  { key: 'pants', label: '👖', title: 'Pants' },
  { key: 'shoes', label: '👟', title: 'Shoes' },
];

interface InventoryItem {
  id: string;
  name: string;
  rarity: string;
  body_part: string;
  preview_emoji: string;
  style_index?: number;
}

const DEFAULT_AVATAR: AvatarData = {
  gender: 'male',
  skinTone: '#FDDBB4',
  hairStyle: 0,
  hairColor: '#3D2B1F',
  eyeStyle: 0,
  noseStyle: 0,
  mouthStyle: 0,
  eyebrowStyle: 0,
  eyelashStyle: 0,
  facialHairStyle: 0,
  shirtStyle: 0,
  pantsStyle: 0,
  shoeStyle: 0,
};

function buildDefaultItems(partKey: string): InventoryItem[] {
  const count = 5;
  return Array.from({ length: count }, (_, i) => ({
    id: `default_${partKey}_${i}`,
    name: `Default ${i + 1}`,
    rarity: 'regular',
    body_part: partKey,
    preview_emoji: PART_TABS.find(t => t.key === partKey)?.label ?? '🎨',
    style_index: i,
  }));
}

function applyItemToAvatar(avatar: AvatarData, item: InventoryItem): AvatarData {
  const idx = item.style_index ?? 0;
  switch (item.body_part) {
    case 'hair': return { ...avatar, hairStyle: idx };
    case 'shirt': return { ...avatar, shirtStyle: idx };
    case 'pants': return { ...avatar, pantsStyle: idx };
    case 'shoes': return { ...avatar, shoeStyle: idx };
    case 'eyes': return { ...avatar, eyeStyle: idx };
    case 'mouth': return { ...avatar, mouthStyle: idx };
    case 'eyebrows': return { ...avatar, eyebrowStyle: idx };
    case 'facialhair': return { ...avatar, facialHairStyle: idx };
    default: return avatar;
  }
}

export default function AvatarCustomizeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId, avatarData: savedAvatarData, avatarEmoji, setAvatarBuilderComplete } = useGame();

  const [avatarData, setAvatarData] = useState<AvatarData>(savedAvatarData ?? DEFAULT_AVATAR);
  const [selectedPart, setSelectedPart] = useState<string>('hair');
  const [inventory, setInventory] = useState<Record<string, InventoryItem[]>>({});
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rotation drag
  const rotationDeg = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newRot = (currentRotation.current + gestureState.dx * 0.5) % 360;
        rotationDeg.setValue(newRot);
      },
      onPanResponderRelease: (_, gestureState) => {
        currentRotation.current = (currentRotation.current + gestureState.dx * 0.5) % 360;
        console.log('[AvatarCustomize] Drag released, rotation:', currentRotation.current);
      },
    })
  ).current;

  useEffect(() => {
    if (userId) {
      console.log('[AvatarCustomize] Loading inventory for userId:', userId);
      loadInventory(userId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadInventory = async (uid: string) => {
    try {
      setLoadingInventory(true);
      const url = `https://qmyylopbzozhqljuqfcl.supabase.co/functions/v1/get-inventory?user_id=${encodeURIComponent(uid)}`;
      console.log('[AvatarCustomize] Fetching inventory from:', url);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch(url, {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXlsb3Biem96aHFsanVxZmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzI5NzMsImV4cCI6MjA2NDU0ODk3M30.Ywm_yCFJMJJFJJFJJFJJFJJFJJFJJFJJFJJFJJFJJFJ',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        console.warn('[AvatarCustomize] Inventory fetch failed:', response.status, text);
        setInventory({});
        return;
      }
      const data = await response.json();
      console.log('[AvatarCustomize] Inventory loaded:', data);
      const grouped: Record<string, InventoryItem[]> = {};
      if (Array.isArray(data)) {
        for (const item of data) {
          const part = item.body_part ?? 'other';
          if (!grouped[part]) grouped[part] = [];
          grouped[part].push(item);
        }
      }
      setInventory(grouped);
    } catch (err) {
      console.warn('[AvatarCustomize] Inventory load error:', err);
      setInventory({});
    } finally {
      setLoadingInventory(false);
    }
  };

  const getItemsForPart = (partKey: string): InventoryItem[] => {
    const defaults = buildDefaultItems(partKey);
    const owned = inventory[partKey] ?? [];
    return [...defaults, ...owned];
  };

  const handlePartTab = (partKey: string) => {
    console.log('[AvatarCustomize] Part tab pressed:', partKey);
    setSelectedPart(partKey);
  };

  const handleItemSelect = (item: InventoryItem) => {
    console.log('[AvatarCustomize] Item selected:', item.name, 'for part:', item.body_part);
    setAvatarData(prev => applyItemToAvatar(prev, item));
  };

  const handleSave = async () => {
    console.log('[AvatarCustomize] Save pressed, avatarData:', avatarData);
    setSaving(true);
    try {
      await setAvatarBuilderComplete(avatarData);
      if (userId) {
        await upsertUser({ id: userId, display_name: '', avatar_emoji: avatarEmoji });
      }
      console.log('[AvatarCustomize] Saved successfully, navigating back');
      router.back();
    } catch (err) {
      console.error('[AvatarCustomize] Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const rotateInterpolated = rotationDeg.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
    extrapolate: 'clamp',
  });

  const partItems = getItemsForPart(selectedPart);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => {
            console.log('[AvatarCustomize] Back pressed');
            router.back();
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ color: COLORS.textSecondary, fontSize: 18 }}>←</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' }}>Back</Text>
        </Pressable>
        <Text style={{ color: COLORS.text, fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '700' }}>
          CUSTOMIZE
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Avatar preview with drag-to-rotate */}
      <View
        style={{ alignItems: 'center', paddingVertical: 16 }}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={{
            transform: [
              { perspective: 800 },
              { rotateY: rotateInterpolated },
            ],
          }}
        >
          <ChibiAvatar avatarData={avatarData} size={220} />
        </Animated.View>
        <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 8 }}>
          ← drag to rotate →
        </Text>
      </View>

      {/* Part selector tabs */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {PART_TABS.map(tab => {
            const isActive = selectedPart === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handlePartTab(tab.key)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: isActive ? COLORS.lime : COLORS.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: isActive ? COLORS.lime : COLORS.border,
                  gap: 2,
                }}
              >
                <Text style={{ fontSize: 20 }}>{tab.label}</Text>
                <Text style={{ color: isActive ? '#0A0A0F' : COLORS.textTertiary, fontSize: 9, fontWeight: '700' }}>
                  {tab.title.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Items list */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loadingInventory ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={COLORS.lime} />
          </View>
        ) : partItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🛍️</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' }}>
              No items owned for this part — visit the Marketplace!
            </Text>
          </View>
        ) : (
          <FlatList
            data={partItems}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            renderItem={({ item }) => {
              const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.regular;
              return (
                <Pressable
                  onPress={() => handleItemSelect(item)}
                  style={({ pressed }) => ({
                    width: 90,
                    backgroundColor: COLORS.surface,
                    borderRadius: 14,
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: rarityColor,
                    opacity: pressed ? 0.8 : 1,
                    gap: 4,
                  })}
                >
                  <Text style={{ fontSize: 28 }}>{item.preview_emoji}</Text>
                  <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={{ backgroundColor: rarityColor + '33', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: rarityColor, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                      {item.rarity}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Save button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => ({
            backgroundColor: COLORS.lime,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed || saving ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#0A0A0F', fontFamily: 'SpaceMono', fontSize: 15, fontWeight: '700' }}>
            {saving ? 'SAVING...' : 'SAVE'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
