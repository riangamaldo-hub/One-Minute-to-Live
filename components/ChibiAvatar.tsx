import React from 'react';
import { View } from 'react-native';
import type { AvatarData } from '@/types/game';

const SHIRT_COLORS = ['#FF4444', '#4444FF', '#44FF44', '#FF8C00', '#9C27B0'];
const PANTS_COLORS = ['#1A237E', '#212121', '#4CAF50', '#795548', '#607D8B'];
const SHOE_COLORS = ['#212121', '#FFFFFF', '#FF4444', '#8B4513', '#4444FF'];

// Male pixel map — 16 wide × 22 tall
const MALE_PIXELS: string[] = [
  ' HHHHHHHHHHHH   ', // 0  hair top
  'HHHHHHHHHHHHHH  ', // 1  hair
  'HSSSSSSSSSSSSSH ', // 2  head top
  'HSBBBBBBBBBBSSH ', // 3  eyebrows
  'HSEESSSSSSEEESH ', // 4  eyes
  'HSSSSSNSSSSSSSH ', // 5  nose
  'HSSSMMMMMMSSSSH ', // 6  mouth
  'HSSFFFFFFFFFFFH ', // 7  facial hair
  ' SSSSSSSSSSSS   ', // 8  chin
  '  TTTTTTTTTT    ', // 9  neck/collar
  ' TTTTTTTTTTTTT  ', // 10 shoulders
  'TTTTTTTTTTTTTTTT', // 11 torso
  'TTTTTTTTTTTTTTTT', // 12 torso
  'TTTTTTTTTTTTTTTT', // 13 torso
  ' TTTTTTTTTTTTT  ', // 14 waist
  '  PPPPPPPPPP    ', // 15 belt
  ' PPPPP PPPPPP   ', // 16 upper legs
  ' PPPPP PPPPPP   ', // 17 legs
  ' PPPPP PPPPPP   ', // 18 legs
  ' PPPPP PPPPPP   ', // 19 lower legs
  ' WWWWW WWWWWW   ', // 20 shoes
  ' WWWWW WWWWWW   ', // 21 shoe bottom
];

// Female pixel map — 16 wide × 22 tall
const FEMALE_PIXELS: string[] = [
  'HHHHHHHHHHHHHH  ', // 0  hair top (wider)
  'HHHHHHHHHHHHHHHH', // 1  hair (full width)
  'HSSSSSSSSSSSSSH ', // 2  head top
  'HSLLLLLLLLLLSSH ', // 3  lashes
  'HSEESSSSSSEEESH ', // 4  eyes
  'HSSSSSNSSSSSSSH ', // 5  nose
  'HSSSMMMMMMSSSSH ', // 6  mouth
  'HSSSSSSSSSSSSSH ', // 7  no facial hair (skin)
  ' SSSSSSSSSSSS   ', // 8  chin
  '  TTTTTTTTTT    ', // 9  neck/collar
  ' TTTTTTTTTTTT   ', // 10 shoulders (slightly narrower)
  ' TTTTTTTTTTTT   ', // 11 torso
  ' TTTTTTTTTTTT   ', // 12 torso
  ' TTTTTTTTTTTT   ', // 13 torso
  '  TTTTTTTTTT    ', // 14 waist (tapered)
  '  PPPPPPPPPP    ', // 15 belt
  '  PPPP PPPPP    ', // 16 upper legs
  '  PPPP PPPPP    ', // 17 legs
  '  PPPP PPPPP    ', // 18 legs
  '  PPPP PPPPP    ', // 19 lower legs
  '  WWWW WWWWW    ', // 20 shoes
  '  WWWW WWWWW    ', // 21 shoe bottom
];

interface ChibiAvatarProps {
  avatarData: AvatarData;
  size?: number;
}

function darken(hex: string, amount = 0.2): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

export default function ChibiAvatar({ avatarData, size = 96 }: ChibiAvatarProps) {
  const pixelSize = (size / 96) * 4;

  const shirtColor = SHIRT_COLORS[avatarData.shirtStyle] ?? SHIRT_COLORS[0];
  const pantsColor = PANTS_COLORS[avatarData.pantsStyle] ?? PANTS_COLORS[0];
  const shoeColor = SHOE_COLORS[avatarData.shoeStyle] ?? SHOE_COLORS[0];
  const skinShadow = darken(avatarData.skinTone, 0.15);
  const hairDark = darken(avatarData.hairColor, 0.25);

  const colorForCode = (code: string): string | null => {
    switch (code) {
      case ' ': return null;
      case 'H': return avatarData.hairColor;
      case 'S': return avatarData.skinTone;
      case 'E': return '#1A1A2E';
      case 'M': return '#CC4444';
      case 'N': return skinShadow;
      case 'T': return shirtColor;
      case 'U': return '#F0F0F0';
      case 'P': return pantsColor;
      case 'W': return shoeColor;
      case 'B': return hairDark;
      case 'L': return '#1A1A1A';
      case 'F': return avatarData.gender === 'male' ? avatarData.hairColor : avatarData.skinTone;
      case 'K': return skinShadow;
      default: return null;
    }
  };

  const pixelMap = avatarData.gender === 'male' ? MALE_PIXELS : FEMALE_PIXELS;

  return (
    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      {pixelMap.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row' }}>
          {row.split('').map((code, colIndex) => {
            const color = colorForCode(code);
            if (color === null) {
              return (
                <View
                  key={colIndex}
                  style={{ width: pixelSize, height: pixelSize, backgroundColor: 'transparent' }}
                />
              );
            }
            return (
              <View
                key={colIndex}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color,
                  borderWidth: 0.5,
                  borderColor: 'rgba(0,0,0,0.08)',
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
