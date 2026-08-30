import React from 'react';
import { View, Text } from 'react-native';
import type { AvatarData } from '@/types/game';

const SHIRT_COLORS = ['#FF4444', '#4444FF', '#44FF44', '#FF8C00', '#9C27B0'];
const PANTS_COLORS = ['#1A237E', '#212121', '#4CAF50', '#795548', '#607D8B'];
const SHOE_COLORS = ['#212121', '#FFFFFF', '#FF4444', '#8B4513', '#4444FF'];

const MALE_HAIR_EMOJIS = ['✂️', '💈', '🌀', '⚡', '🥚'];
const FEMALE_HAIR_EMOJIS = ['💇', '✂️', '🌀', '🎀', '🪢'];

const EYE_EMOJIS = ['👁️', '😐', '😑', '🙄', '😏'];
const MOUTH_EMOJIS = ['😊', '😁', '😄', '🙂', '😌'];
const NOSE_CHARS = ['·', '•', 'ᴗ', 'ω', '∘'];

const MALE_FACIAL_HAIR = ['', '·̣·̣', '👨', '🧔', '🧔'];
const FEMALE_LASH_CHARS = ['', '—', '══', '≡≡', '≣≣'];

interface ChibiAvatarProps {
  avatarData: AvatarData;
  size?: number;
}

export default function ChibiAvatar({ avatarData, size = 120 }: ChibiAvatarProps) {
  const scale = size / 120;

  const shirtColor = SHIRT_COLORS[avatarData.shirtStyle] ?? SHIRT_COLORS[0];
  const pantsColor = PANTS_COLORS[avatarData.pantsStyle] ?? PANTS_COLORS[0];
  const shoeColor = SHOE_COLORS[avatarData.shoeStyle] ?? SHOE_COLORS[0];

  const hairEmoji = avatarData.gender === 'male'
    ? MALE_HAIR_EMOJIS[avatarData.hairStyle] ?? '✂️'
    : FEMALE_HAIR_EMOJIS[avatarData.hairStyle] ?? '💇';

  const eyeEmoji = EYE_EMOJIS[avatarData.eyeStyle] ?? '👁️';
  const mouthEmoji = MOUTH_EMOJIS[avatarData.mouthStyle] ?? '😊';
  const noseChar = NOSE_CHARS[avatarData.noseStyle] ?? '·';

  const facialHairChar = avatarData.gender === 'male'
    ? MALE_FACIAL_HAIR[avatarData.facialHairStyle] ?? ''
    : '';
  const lashChar = avatarData.gender === 'female'
    ? FEMALE_LASH_CHARS[avatarData.eyelashStyle] ?? ''
    : '';

  const headSize = 56 * scale;
  const bodyWidth = 44 * scale;
  const bodyHeight = 36 * scale;
  const armWidth = 10 * scale;
  const armHeight = 28 * scale;
  const legWidth = 16 * scale;
  const legHeight = 24 * scale;
  const footWidth = 18 * scale;
  const footHeight = 10 * scale;
  const hairHeight = 18 * scale;
  const hairWidth = headSize + 4 * scale;

  return (
    <View style={{ alignItems: 'center', width: size, height: size * 1.4 }}>
      {/* Hair */}
      <View
        style={{
          width: hairWidth,
          height: hairHeight,
          backgroundColor: avatarData.hairColor,
          borderTopLeftRadius: hairWidth / 2,
          borderTopRightRadius: hairWidth / 2,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Text style={{ fontSize: 10 * scale }}>{hairEmoji}</Text>
      </View>

      {/* Head */}
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: avatarData.skinTone,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -8 * scale,
          zIndex: 1,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      >
        {/* Eyebrows */}
        <View style={{ flexDirection: 'row', gap: 6 * scale, marginBottom: 2 * scale }}>
          <View style={{ width: 10 * scale, height: 2 * scale, backgroundColor: avatarData.hairColor, borderRadius: 1 }} />
          <View style={{ width: 10 * scale, height: 2 * scale, backgroundColor: avatarData.hairColor, borderRadius: 1 }} />
        </View>

        {/* Lashes (female) */}
        {lashChar ? (
          <Text style={{ fontSize: 7 * scale, color: '#1A1A1A', marginBottom: 1 * scale }}>{lashChar}</Text>
        ) : null}

        {/* Eyes */}
        <View style={{ flexDirection: 'row', gap: 8 * scale, marginBottom: 2 * scale }}>
          <Text style={{ fontSize: 9 * scale }}>{eyeEmoji}</Text>
          <Text style={{ fontSize: 9 * scale }}>{eyeEmoji}</Text>
        </View>

        {/* Nose */}
        <Text style={{ fontSize: 10 * scale, color: 'rgba(0,0,0,0.4)', marginBottom: 2 * scale }}>{noseChar}</Text>

        {/* Mouth */}
        <Text style={{ fontSize: 10 * scale }}>{mouthEmoji}</Text>

        {/* Facial hair (male) */}
        {facialHairChar ? (
          <Text style={{ fontSize: 8 * scale, color: avatarData.hairColor, marginTop: 1 * scale }}>{facialHairChar}</Text>
        ) : null}
      </View>

      {/* Body row: arm + torso + arm */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 * scale }}>
        {/* Left arm */}
        <View
          style={{
            width: armWidth,
            height: armHeight,
            backgroundColor: shirtColor,
            borderRadius: armWidth / 2,
            marginTop: 4 * scale,
          }}
        />

        {/* Torso */}
        <View
          style={{
            width: bodyWidth,
            height: bodyHeight,
            backgroundColor: shirtColor,
            borderRadius: 8 * scale,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10 * scale, color: 'rgba(255,255,255,0.5)' }}>★</Text>
        </View>

        {/* Right arm */}
        <View
          style={{
            width: armWidth,
            height: armHeight,
            backgroundColor: shirtColor,
            borderRadius: armWidth / 2,
            marginTop: 4 * scale,
          }}
        />
      </View>

      {/* Legs */}
      <View style={{ flexDirection: 'row', gap: 4 * scale, marginTop: 2 * scale }}>
        <View
          style={{
            width: legWidth,
            height: legHeight,
            backgroundColor: pantsColor,
            borderRadius: 4 * scale,
          }}
        />
        <View
          style={{
            width: legWidth,
            height: legHeight,
            backgroundColor: pantsColor,
            borderRadius: 4 * scale,
          }}
        />
      </View>

      {/* Feet */}
      <View style={{ flexDirection: 'row', gap: 4 * scale, marginTop: 2 * scale }}>
        <View
          style={{
            width: footWidth,
            height: footHeight,
            backgroundColor: shoeColor,
            borderRadius: footHeight / 2,
          }}
        />
        <View
          style={{
            width: footWidth,
            height: footHeight,
            backgroundColor: shoeColor,
            borderRadius: footHeight / 2,
          }}
        />
      </View>
    </View>
  );
}
