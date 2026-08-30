import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useGame } from '@/contexts/GameContext';
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
  limeMuted: 'rgba(168,230,61,0.12)',
  border: 'rgba(255,255,255,0.06)',
  primary: '#FF4444',
};

const RETRY_KEY = '@sixty_seconds/retries_remaining';

const RETRY_PRODUCTS = [
  { id: 'retry_single', name: 'Single Retry', price: '$0.99', retries: 1 },
  { id: 'retry_pack', name: 'Retry Pack', price: '$4.99', retries: 7 },
  { id: 'retry_mega', name: 'Mega Pack', price: '$9.99', retries: 15 },
];

const CATEGORY_COLORS: Record<string, string> = {
  hair: '#9C27B0',
  outfit: '#FF8C00',
  accessory: '#4444FF',
  skin: '#44AA44',
};

interface ScenarioPack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price: string;
}

interface CosmeticItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  price: string;
  preview_data?: Partial<AvatarData>;
}

// Skeleton card placeholder
function SkeletonCard({ wide }: { wide?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        flex: wide ? undefined : 1,
        height: wide ? 80 : 160,
        opacity: 0.5,
      }}
    />
  );
}

// Retry tab
function RetriesTab({ retryCount, onRetryCountChange }: { retryCount: number; onRetryCountChange: (n: number) => void }) {
  const handleBuy = (product: typeof RETRY_PRODUCTS[0]) => {
    console.log('[Marketplace] Retry purchase pressed:', product.id, product.price, product.retries, 'retries');
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Purchase', `Opens App Store purchase for ${product.retries} ${product.retries === 1 ? 'retry' : 'retries'} (${product.price})`);
  };

  const retryDisplay = String(retryCount);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={{
        backgroundColor: COLORS.limeMuted,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lime,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
      }}>
        <Text style={{ fontSize: 22 }}>⚡</Text>
        <View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontFamily: 'SpaceMono', letterSpacing: 1 }}>YOUR RETRIES</Text>
          <Text style={{ color: COLORS.lime, fontSize: 26, fontFamily: 'SpaceMono', fontWeight: '700' }}>{retryDisplay}</Text>
        </View>
      </View>

      {RETRY_PRODUCTS.map((product) => {
        const retriesLabel = product.retries === 1 ? '1 retry' : `${product.retries} retries`;
        return (
          <View
            key={product.id}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Icon */}
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: COLORS.limeMuted,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.lime,
            }}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 15, fontFamily: 'SpaceMono', fontWeight: '700' }}>
                {product.name}
              </Text>
              <Text style={{ color: COLORS.lime, fontSize: 13, fontFamily: 'SpaceMono', marginTop: 2 }}>
                {retriesLabel}
              </Text>
            </View>

            {/* Price button */}
            <Pressable
              onPress={() => handleBuy(product)}
              style={({ pressed }) => ({
                backgroundColor: COLORS.lime,
                borderRadius: 10,
                height: 40,
                paddingHorizontal: 14,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: COLORS.background, fontSize: 13, fontFamily: 'SpaceMono', fontWeight: '700' }}>
                {product.price}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

// Scenario packs tab
function PacksTab() {
  const [packs, setPacks] = useState<ScenarioPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPacks = useCallback(async () => {
    console.log('[Marketplace] Fetching scenario_packs from Supabase');
    setLoading(true);
    setError(false);
    try {
      const { data, error: sbError } = await supabase
        .from('scenario_packs')
        .select('*')
        .order('name');
      if (sbError) {
        console.log('[Marketplace] scenario_packs fetch error:', sbError.message);
        setError(true);
      } else {
        console.log('[Marketplace] scenario_packs fetched:', data?.length ?? 0, 'items');
        setPacks((data as ScenarioPack[]) ?? []);
      }
    } catch (e) {
      console.log('[Marketplace] scenario_packs fetch exception:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleBuy = (pack: ScenarioPack) => {
    console.log('[Marketplace] Scenario pack purchase pressed:', pack.id, pack.name);
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Purchase', `Opens App Store purchase for ${pack.name}`);
  };

  if (loading) {
    return (
      <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
          Could not load items. Tap to retry.
        </Text>
        <Pressable
          onPress={fetchPacks}
          style={({ pressed }) => ({
            backgroundColor: COLORS.lime,
            borderRadius: 10,
            paddingHorizontal: 24,
            paddingVertical: 12,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: COLORS.background, fontFamily: 'SpaceMono', fontWeight: '700' }}>RETRY</Text>
        </Pressable>
      </View>
    );
  }

  if (packs.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
          No scenario packs available yet. Check back soon!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {packs.map((pack) => {
          const packPrice = pack.price ?? '$1.99';
          return (
            <View
              key={pack.id}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 16,
                width: '47%',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 8 }}>{pack.emoji ?? '📦'}</Text>
              <Text style={{
                color: COLORS.text,
                fontSize: 13,
                fontFamily: 'SpaceMono',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 6,
              }}>
                {pack.name}
              </Text>
              <Text
                style={{ color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', marginBottom: 10 }}
                numberOfLines={2}
              >
                {pack.description}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '700' }}>
                  {packPrice}
                </Text>
              </View>
              <Pressable
                onPress={() => handleBuy(pack)}
                style={({ pressed }) => ({
                  backgroundColor: COLORS.lime,
                  borderRadius: 10,
                  height: 36,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                  width: '100%',
                })}
              >
                <Text style={{ color: COLORS.background, fontSize: 12, fontFamily: 'SpaceMono', fontWeight: '700' }}>
                  GET PACK
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// Cosmetics tab
function CosmeticsTab() {
  const { avatarData } = useGame();
  const [items, setItems] = useState<CosmeticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);

  const fetchItems = useCallback(async () => {
    console.log('[Marketplace] Fetching cosmetic_items from Supabase');
    setLoading(true);
    setError(false);
    try {
      const { data, error: sbError } = await supabase
        .from('cosmetic_items')
        .select('*')
        .order('category');
      if (sbError) {
        console.log('[Marketplace] cosmetic_items fetch error:', sbError.message);
        setError(true);
      } else {
        console.log('[Marketplace] cosmetic_items fetched:', data?.length ?? 0, 'items');
        setItems((data as CosmeticItem[]) ?? []);
      }
    } catch (e) {
      console.log('[Marketplace] cosmetic_items fetch exception:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleBuy = (item: CosmeticItem) => {
    console.log('[Marketplace] Cosmetic purchase pressed:', item.id, item.name, item.category);
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Purchase', `Opens App Store purchase for ${item.name}`);
  };

  const handlePreview = (item: CosmeticItem) => {
    console.log('[Marketplace] Cosmetic preview tapped:', item.id, item.name);
    setPreviewItem(prev => prev?.id === item.id ? null : item);
  };

  const previewAvatar: AvatarData | null = avatarData && previewItem?.preview_data
    ? { ...avatarData, ...previewItem.preview_data }
    : avatarData;

  if (loading) {
    return (
      <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
          Could not load items. Tap to retry.
        </Text>
        <Pressable
          onPress={fetchItems}
          style={({ pressed }) => ({
            backgroundColor: COLORS.lime,
            borderRadius: 10,
            paddingHorizontal: 24,
            paddingVertical: 12,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: COLORS.background, fontFamily: 'SpaceMono', fontWeight: '700' }}>RETRY</Text>
        </Pressable>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🎨</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center' }}>
          No cosmetics available yet. Check back soon!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Live preview strip */}
      {previewItem && previewAvatar ? (
        <View style={{
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLORS.lime,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
          <ChibiAvatar avatarData={previewAvatar} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontFamily: 'SpaceMono', letterSpacing: 1 }}>PREVIEW</Text>
            <Text style={{ color: COLORS.lime, fontSize: 14, fontFamily: 'SpaceMono', fontWeight: '700', marginTop: 2 }}>
              {previewItem.name}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>
              Tap card again to dismiss
            </Text>
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {items.map((item) => {
          const catColor = CATEGORY_COLORS[item.category] ?? COLORS.textSecondary;
          const itemPrice = item.price ?? '$0.99';
          const isPreviewActive = previewItem?.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => handlePreview(item)}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isPreviewActive ? COLORS.lime : COLORS.border,
                padding: 14,
                width: '47%',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 8 }}>{item.emoji ?? '✨'}</Text>
              <Text style={{
                color: COLORS.text,
                fontSize: 12,
                fontFamily: 'SpaceMono',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 6,
              }}>
                {item.name}
              </Text>
              {/* Category badge */}
              <View style={{
                backgroundColor: `${catColor}22`,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: `${catColor}55`,
              }}>
                <Text style={{ color: catColor, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                  {item.category.toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
                {itemPrice}
              </Text>
              <Pressable
                onPress={() => handleBuy(item)}
                style={({ pressed }) => ({
                  backgroundColor: COLORS.lime,
                  borderRadius: 10,
                  height: 34,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                  width: '100%',
                })}
              >
                <Text style={{ color: COLORS.background, fontSize: 11, fontFamily: 'SpaceMono', fontWeight: '700' }}>
                  GET
                </Text>
              </Pressable>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const TABS = [
  { id: 'retries', label: '⚡ Retries' },
  { id: 'packs', label: '📦 Packs' },
  { id: 'cosmetics', label: '🎨 Cosmetics' },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadRetries = async () => {
      console.log('[Marketplace] Loading retry count from AsyncStorage');
      try {
        const val = await AsyncStorage.getItem(RETRY_KEY);
        const count = val !== null ? parseInt(val, 10) : 0;
        console.log('[Marketplace] Retry count loaded:', count);
        setRetryCount(isNaN(count) ? 0 : count);
      } catch (e) {
        console.log('[Marketplace] Failed to load retry count:', e);
      }
    };
    loadRetries();
  }, []);

  const handleBack = () => {
    console.log('[Marketplace] Back button pressed');
    router.back();
  };

  const handleTabPress = (index: number) => {
    console.log('[Marketplace] Tab pressed:', TABS[index].id);
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    setActiveTab(index);
  };

  const retryDisplay = String(retryCount);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              marginRight: 14,
              opacity: pressed ? 0.6 : 1,
              padding: 4,
            })}
          >
            <Text style={{ color: COLORS.lime, fontSize: 22, fontFamily: 'SpaceMono' }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: COLORS.lime,
              fontSize: 20,
              fontFamily: 'SpaceMono',
              fontWeight: '700',
              letterSpacing: 2,
            }}>
              MARKETPLACE
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 1 }}>
              Gear up. Survive longer.
            </Text>
          </View>
          {/* Retry count badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: COLORS.limeMuted,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: COLORS.lime,
          }}>
            <Text style={{ fontSize: 14 }}>⚡</Text>
            <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '700' }}>
              {retryDisplay}
            </Text>
          </View>
        </View>

        {/* Tab bar */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
          {TABS.map((tab, i) => {
            const isActive = activeTab === i;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabPress(i)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? COLORS.lime : 'transparent',
                }}
              >
                <Text style={{
                  color: isActive ? COLORS.lime : '#5A5A72',
                  fontSize: 12,
                  fontFamily: 'SpaceMono',
                  fontWeight: '700',
                }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 0 && (
          <RetriesTab retryCount={retryCount} onRetryCountChange={setRetryCount} />
        )}
        {activeTab === 1 && <PacksTab />}
        {activeTab === 2 && <CosmeticsTab />}
      </View>
    </View>
  );
}
