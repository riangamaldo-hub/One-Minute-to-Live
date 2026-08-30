import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import ChibiAvatar from '@/components/ChibiAvatar';
import type { AvatarData } from '@/types/game';

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

const SKIN_TONES = ['#FDDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const HAIR_COLORS = ['#1A1A1A', '#8B4513', '#DAA520', '#FF6B35', '#E91E8C', '#9C27B0'];
const SHIRT_COLORS = ['#FF4444', '#4444FF', '#44FF44', '#FF8C00', '#9C27B0'];
const PANTS_COLORS = ['#1A237E', '#212121', '#4CAF50', '#795548', '#607D8B'];
const SHOE_COLORS = ['#212121', '#FFFFFF', '#FF4444', '#8B4513', '#4444FF'];

const MALE_HAIR_STYLES = [
  { label: 'Buzz Cut', emoji: '✂️' },
  { label: 'Side Part', emoji: '💈' },
  { label: 'Curly', emoji: '🌀' },
  { label: 'Mohawk', emoji: '⚡' },
  { label: 'Bald', emoji: '🥚' },
];
const FEMALE_HAIR_STYLES = [
  { label: 'Long Straight', emoji: '💇' },
  { label: 'Bob', emoji: '✂️' },
  { label: 'Curly', emoji: '🌀' },
  { label: 'Ponytail', emoji: '🎀' },
  { label: 'Braids', emoji: '🪢' },
];

const FACE_TABS = ['Eyes', 'Nose', 'Mouth', 'Brows'];
const FEMALE_LASH_LABELS = ['None', 'Light', 'Medium', 'Bold', 'Dramatic'];
const MALE_FACIAL_HAIR_LABELS = ['None', 'Stubble', 'Mustache', 'Goatee', 'Full Beard'];
const OUTFIT_TABS = ['Shirt', 'Pants', 'Shoes'];

const TOTAL_STEPS = 8;

const DEFAULT_AVATAR: AvatarData = {
  gender: 'male',
  skinTone: '#F1C27D',
  hairStyle: 0,
  hairColor: '#1A1A1A',
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

function OptionCard({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected ? COLORS.limeMuted : COLORS.surface,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? COLORS.lime : COLORS.border,
        padding: 12,
        alignItems: 'center',
        minWidth: 72,
        marginRight: 10,
      }}
    >
      {emoji ? <Text style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</Text> : null}
      <Text style={{ color: selected ? COLORS.lime : COLORS.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ColorSwatch({
  color,
  selected,
  onPress,
  size = 44,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: selected ? 3 : 1.5,
        borderColor: selected ? COLORS.lime : 'rgba(255,255,255,0.15)',
        marginRight: 10,
      }}
    />
  );
}

export default function AvatarBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAvatarBuilderComplete } = useGame();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<AvatarData>({ ...DEFAULT_AVATAR });
  const [faceTab, setFaceTab] = useState(0);
  const [outfitTab, setOutfitTab] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const updateProgress = (newStep: number) => {
    Animated.timing(progressAnim, {
      toValue: (newStep + 1) / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const goNext = () => {
    console.log('[AvatarBuilder] Next pressed, step:', step);
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextStep = step + 1;
    setStep(nextStep);
    updateProgress(nextStep);
  };

  const goBack = () => {
    console.log('[AvatarBuilder] Back pressed, step:', step);
    if (step === 0) return;
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prevStep = step - 1;
    setStep(prevStep);
    updateProgress(prevStep);
  };

  const handleConfirm = async () => {
    console.log('[AvatarBuilder] Confirm pressed, avatar:', avatar);
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setAvatarBuilderComplete(avatar);
    router.replace('/rules');
  };

  const set = <K extends keyof AvatarData>(key: K, value: AvatarData[K]) => {
    setAvatar(prev => ({ ...prev, [key]: value }));
  };

  const hairStyles = avatar.gender === 'male' ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;
  const stepLabel = [
    'Gender',
    'Skin Tone',
    'Hair Style',
    'Hair Color',
    'Face',
    avatar.gender === 'male' ? 'Facial Hair' : 'Eyelashes',
    'Outfit',
    'Confirm',
  ][step];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', paddingHorizontal: 20 }}>
            <Pressable
              onPress={() => {
                console.log('[AvatarBuilder] Gender selected: male');
                set('gender', 'male');
              }}
              style={{
                flex: 1,
                backgroundColor: avatar.gender === 'male' ? COLORS.limeMuted : COLORS.surface,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: avatar.gender === 'male' ? COLORS.lime : COLORS.border,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 12 }}>♂</Text>
              <Text style={{ color: avatar.gender === 'male' ? COLORS.lime : COLORS.text, fontSize: 18, fontWeight: '800' }}>
                MALE
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                console.log('[AvatarBuilder] Gender selected: female');
                set('gender', 'female');
              }}
              style={{
                flex: 1,
                backgroundColor: avatar.gender === 'female' ? COLORS.limeMuted : COLORS.surface,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: avatar.gender === 'female' ? COLORS.lime : COLORS.border,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 12 }}>♀</Text>
              <Text style={{ color: avatar.gender === 'female' ? COLORS.lime : COLORS.text, fontSize: 18, fontWeight: '800' }}>
                FEMALE
              </Text>
            </Pressable>
          </View>
        );

      case 1:
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, flexDirection: 'row' }}>
            {SKIN_TONES.map((tone) => (
              <ColorSwatch
                key={tone}
                color={tone}
                selected={avatar.skinTone === tone}
                onPress={() => {
                  console.log('[AvatarBuilder] Skin tone selected:', tone);
                  set('skinTone', tone);
                }}
                size={52}
              />
            ))}
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, flexDirection: 'row' }}>
            {hairStyles.map((style, i) => (
              <OptionCard
                key={i}
                label={style.label}
                emoji={style.emoji}
                selected={avatar.hairStyle === i}
                onPress={() => {
                  console.log('[AvatarBuilder] Hair style selected:', i, style.label);
                  set('hairStyle', i);
                }}
              />
            ))}
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, flexDirection: 'row' }}>
            {HAIR_COLORS.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={avatar.hairColor === color}
                onPress={() => {
                  console.log('[AvatarBuilder] Hair color selected:', color);
                  set('hairColor', color);
                }}
                size={48}
              />
            ))}
          </ScrollView>
        );

      case 4: {
        const faceOptions = [
          { key: 'eyeStyle' as keyof AvatarData, labels: ['Eye 1', 'Eye 2', 'Eye 3', 'Eye 4', 'Eye 5'], emoji: '👁️' },
          { key: 'noseStyle' as keyof AvatarData, labels: ['Nose 1', 'Nose 2', 'Nose 3', 'Nose 4', 'Nose 5'], emoji: '👃' },
          { key: 'mouthStyle' as keyof AvatarData, labels: ['Smile 1', 'Smile 2', 'Smile 3', 'Smile 4', 'Smile 5'], emoji: '👄' },
          { key: 'eyebrowStyle' as keyof AvatarData, labels: ['Brow 1', 'Brow 2', 'Brow 3', 'Brow 4', 'Brow 5'], emoji: '〰️' },
        ];
        const current = faceOptions[faceTab];
        return (
          <View>
            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4 }}>
              {FACE_TABS.map((tab, i) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    console.log('[AvatarBuilder] Face tab selected:', tab);
                    setFaceTab(i);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: faceTab === i ? COLORS.limeMuted : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: faceTab === i ? COLORS.lime : COLORS.textSecondary, fontSize: 12, fontWeight: '700' }}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, flexDirection: 'row' }}>
              {current.labels.map((label, i) => (
                <OptionCard
                  key={i}
                  label={label}
                  emoji={current.emoji}
                  selected={(avatar[current.key] as number) === i}
                  onPress={() => {
                    console.log('[AvatarBuilder] Face feature selected:', current.key, i);
                    set(current.key, i as AvatarData[typeof current.key]);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        );
      }

      case 5: {
        const labels = avatar.gender === 'male' ? MALE_FACIAL_HAIR_LABELS : FEMALE_LASH_LABELS;
        const key: keyof AvatarData = avatar.gender === 'male' ? 'facialHairStyle' : 'eyelashStyle';
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, flexDirection: 'row' }}>
            {labels.map((label, i) => (
              <OptionCard
                key={i}
                label={label}
                emoji={avatar.gender === 'male' ? '🧔' : '✨'}
                selected={(avatar[key] as number) === i}
                onPress={() => {
                  console.log('[AvatarBuilder] Step 5 feature selected:', key, i, label);
                  set(key, i as AvatarData[typeof key]);
                }}
              />
            ))}
          </ScrollView>
        );
      }

      case 6: {
        const outfitOptions = [
          { key: 'shirtStyle' as keyof AvatarData, colors: SHIRT_COLORS },
          { key: 'pantsStyle' as keyof AvatarData, colors: PANTS_COLORS },
          { key: 'shoeStyle' as keyof AvatarData, colors: SHOE_COLORS },
        ];
        const current = outfitOptions[outfitTab];
        return (
          <View>
            <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4 }}>
              {OUTFIT_TABS.map((tab, i) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    console.log('[AvatarBuilder] Outfit tab selected:', tab);
                    setOutfitTab(i);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: outfitTab === i ? COLORS.limeMuted : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: outfitTab === i ? COLORS.lime : COLORS.textSecondary, fontSize: 12, fontWeight: '700' }}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, flexDirection: 'row' }}>
              {current.colors.map((color, i) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={(avatar[current.key] as number) === i}
                  onPress={() => {
                    console.log('[AvatarBuilder] Outfit color selected:', current.key, i, color);
                    set(current.key, i as AvatarData[typeof current.key]);
                  }}
                  size={48}
                />
              ))}
            </ScrollView>
          </View>
        );
      }

      case 7:
        return (
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <ChibiAvatar avatarData={avatar} size={160} />
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 16, textAlign: 'center' }}>
              Looking good, Survivor!
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1.5 }}>
            STEP {step + 1} OF {TOTAL_STEPS}
          </Text>
          <Text style={{ color: COLORS.lime, fontFamily: 'SpaceMono', fontSize: 13, fontWeight: '700' }}>
            {stepLabel.toUpperCase()}
          </Text>
        </View>
        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: COLORS.surfaceSecondary, borderRadius: 2, overflow: 'hidden' }}>
          <Animated.View style={{ height: '100%', width: progressWidth, backgroundColor: COLORS.lime, borderRadius: 2 }} />
        </View>
      </View>

      {/* Avatar preview */}
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <ChibiAvatar avatarData={avatar} size={120} />
      </View>

      {/* Step content */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {renderStepContent()}
      </View>

      {/* Navigation buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 12 }}>
        {step === TOTAL_STEPS - 1 ? (
          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => ({
              backgroundColor: COLORS.lime,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: COLORS.background, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 }}>
              THIS IS ME! ✓
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={goNext}
            style={({ pressed }) => ({
              backgroundColor: COLORS.lime,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: COLORS.background, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 }}>
              NEXT →
            </Text>
          </Pressable>
        )}
        {step > 0 && (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => ({
              backgroundColor: COLORS.surfaceSecondary,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              borderWidth: 1,
              borderColor: COLORS.border,
            })}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontWeight: '700' }}>
              ← BACK
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
