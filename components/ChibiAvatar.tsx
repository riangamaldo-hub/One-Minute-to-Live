import React from 'react';
import Svg, { G, Ellipse, Rect, Circle, Path, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { AvatarData } from '@/types/game';

const SHIRT_COLORS = ['#FF4444', '#4444FF', '#44FF44', '#FF8C00', '#9C27B0'];
const PANTS_COLORS = ['#1A237E', '#212121', '#4CAF50', '#795548', '#607D8B'];
const SHOE_COLORS = ['#212121', '#FFFFFF', '#FF4444', '#8B4513', '#4444FF'];

// ── Color helpers ──────────────────────────────────────────────────────────────
function darken(hex: string, amount = 0.2): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, amount = 0.2): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount));
  const b = Math.min(255, Math.floor((num & 0xff) + (255 - (num & 0xff)) * amount));
  return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Eye iris colors ────────────────────────────────────────────────────────────
const EYE_COLORS = ['#3D5A80', '#2D6A4F', '#8B4513', '#6B35A0', '#1A1A2E'];

// ── Props ──────────────────────────────────────────────────────────────────────
interface ChibiAvatarProps {
  avatarData: AvatarData;
  size?: number;
}

// ── Shadow ─────────────────────────────────────────────────────────────────────
function Shadow() {
  return <Ellipse cx={100} cy={310} rx={45} ry={8} fill="rgba(0,0,0,0.25)" />;
}

// ── Shoes ──────────────────────────────────────────────────────────────────────
function Shoes({ shoeStyle, shoeColor }: { shoeStyle: number; shoeColor: string }) {
  const soleDark = darken(shoeColor, 0.35);
  const soleColor = shoeColor === '#FFFFFF' ? '#DDDDDD' : soleDark;

  // Style dimensions
  const heights = [22, 30, 28, 20, 22];
  const h = heights[shoeStyle] ?? 22;
  const shoeY = 272;
  const soleH = shoeStyle === 3 ? 5 : 8;
  const rx = shoeStyle === 1 ? 5 : shoeStyle === 3 ? 4 : 11;

  return (
    <G>
      {/* Socks */}
      <Rect x={56} y={shoeY - 6} width={34} height={7} rx={3} fill="#F5F5F5" />
      <Rect x={110} y={shoeY - 6} width={34} height={7} rx={3} fill="#F5F5F5" />

      {/* Left shoe */}
      <Rect x={52} y={shoeY} width={38} height={h} rx={rx} fill={shoeColor} />
      <Rect x={52} y={shoeY + h - soleH} width={38} height={soleH} rx={rx} fill={soleColor} />

      {/* Right shoe */}
      <Rect x={110} y={shoeY} width={38} height={h} rx={rx} fill={shoeColor} />
      <Rect x={110} y={shoeY + h - soleH} width={38} height={soleH} rx={rx} fill={soleColor} />

      {/* High-top ankle collar */}
      {shoeStyle === 2 && (
        <G>
          <Rect x={52} y={shoeY} width={38} height={8} rx={4} fill={lighten(shoeColor, 0.15)} />
          <Rect x={110} y={shoeY} width={38} height={8} rx={4} fill={lighten(shoeColor, 0.15)} />
        </G>
      )}

      {/* Sandal straps */}
      {shoeStyle === 4 && (
        <G>
          <Rect x={52} y={shoeY + 4} width={38} height={4} rx={2} fill={darken(shoeColor, 0.2)} />
          <Rect x={52} y={shoeY + 12} width={38} height={4} rx={2} fill={darken(shoeColor, 0.2)} />
          <Rect x={110} y={shoeY + 4} width={38} height={4} rx={2} fill={darken(shoeColor, 0.2)} />
          <Rect x={110} y={shoeY + 12} width={38} height={4} rx={2} fill={darken(shoeColor, 0.2)} />
        </G>
      )}

      {/* Boot toe cap */}
      {shoeStyle === 1 && (
        <G>
          <Rect x={52} y={shoeY + h - 10} width={14} height={10} rx={2} fill={darken(shoeColor, 0.15)} />
          <Rect x={110} y={shoeY + h - 10} width={14} height={10} rx={2} fill={darken(shoeColor, 0.15)} />
        </G>
      )}
    </G>
  );
}

// ── Pants ──────────────────────────────────────────────────────────────────────
function Pants({ pantsStyle, pantsColor }: { pantsStyle: number; pantsColor: string }) {
  const waistDark = darken(pantsColor, 0.22);
  const highlight = hexToRgba(lighten(pantsColor, 0.3), 0.4);

  // Style: leg width and height
  const legWidths = [36, 28, 42, 36, 32];
  const legHeights = [80, 80, 80, 45, 76];
  const lw = legWidths[pantsStyle] ?? 36;
  const lh = legHeights[pantsStyle] ?? 80;

  // Center legs
  const leftX = 57 - (lw - 36) / 2;
  const rightX = 113 - (lw - 36) / 2;
  const legY = 200;

  // Cuff for joggers
  const cuffY = legY + lh - 10;

  return (
    <G>
      {/* Left leg */}
      <Rect x={leftX} y={legY} width={lw} height={lh} rx={8} fill={pantsColor} />
      {/* Right leg */}
      <Rect x={rightX} y={legY} width={lw} height={lh} rx={8} fill={pantsColor} />
      {/* Crotch join */}
      <Rect x={86} y={legY} width={28} height={22} rx={4} fill={pantsColor} />
      {/* Waistband */}
      <Rect x={50} y={196} width={100} height={14} rx={7} fill={waistDark} />
      {/* Highlight stripe left */}
      <Rect x={leftX + 4} y={legY + 6} width={5} height={lh - 16} rx={2.5} fill={highlight} />
      {/* Highlight stripe right */}
      <Rect x={rightX + 4} y={legY + 6} width={5} height={lh - 16} rx={2.5} fill={highlight} />

      {/* Cargo pockets */}
      {pantsStyle === 2 && (
        <G>
          <Rect x={leftX + 2} y={legY + 20} width={16} height={20} rx={3} fill={darken(pantsColor, 0.15)} />
          <Rect x={rightX + lw - 18} y={legY + 20} width={16} height={20} rx={3} fill={darken(pantsColor, 0.15)} />
        </G>
      )}

      {/* Jogger cuffs */}
      {pantsStyle === 4 && (
        <G>
          <Rect x={leftX} y={cuffY} width={lw} height={10} rx={5} fill={darken(pantsColor, 0.18)} />
          <Rect x={rightX} y={cuffY} width={lw} height={10} rx={5} fill={darken(pantsColor, 0.18)} />
        </G>
      )}
    </G>
  );
}

// ── Shirt ──────────────────────────────────────────────────────────────────────
function Shirt({
  shirtStyle,
  shirtColor,
  skinTone,
  gender,
}: {
  shirtStyle: number;
  shirtColor: string;
  skinTone: string;
  gender: 'male' | 'female';
}) {
  const collarDark = darken(shirtColor, 0.18);
  const shadow = hexToRgba(darken(shirtColor, 0.25), 0.5);
  const bodyX = gender === 'female' ? 50 : 46;
  const bodyW = gender === 'female' ? 100 : 108;

  // Tank top is sleeveless
  const isTank = shirtStyle === 4;
  const isHoodie = shirtStyle === 3;

  return (
    <G>
      {/* Hoodie hood behind head */}
      {isHoodie && (
        <Ellipse cx={100} cy={100} rx={58} ry={30} fill={darken(shirtColor, 0.1)} />
      )}

      {/* Shirt body */}
      <Rect x={bodyX} y={130} width={bodyW} height={80} rx={10} fill={shirtColor} />

      {/* Right-side shadow for depth */}
      <Rect x={bodyX + bodyW - 22} y={134} width={18} height={72} rx={8} fill={shadow} />

      {/* Sleeves */}
      {!isTank && (
        <G>
          {/* Left sleeve */}
          <Rect x={28} y={132} width={24} height={52} rx={12} fill={shirtColor} />
          {/* Right sleeve */}
          <Rect x={148} y={132} width={24} height={52} rx={12} fill={shirtColor} />
          {/* Sleeve cuffs */}
          <Rect x={28} y={176} width={24} height={8} rx={4} fill={collarDark} />
          <Rect x={148} y={176} width={24} height={8} rx={4} fill={collarDark} />
        </G>
      )}

      {/* Collar shapes per style */}
      {shirtStyle === 0 && (
        // Crew neck
        <Path
          d={`M 82 130 Q 100 142 118 130`}
          stroke={collarDark}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {shirtStyle === 1 && (
        // V-neck
        <Path
          d={`M 82 130 L 100 152 L 118 130`}
          stroke={collarDark}
          strokeWidth={3}
          fill={collarDark}
          strokeLinejoin="round"
        />
      )}
      {shirtStyle === 2 && (
        // Polo collar flaps
        <G>
          <Rect x={88} y={126} width={12} height={20} rx={4} fill={collarDark} />
          <Rect x={100} y={126} width={12} height={20} rx={4} fill={darken(shirtColor, 0.1)} />
        </G>
      )}
      {isHoodie && (
        // Hoodie front pocket
        <Rect x={82} y={172} width={36} height={22} rx={6} fill={darken(shirtColor, 0.12)} />
      )}
      {isTank && (
        // Tank top straps
        <G>
          <Rect x={bodyX + 8} y={126} width={14} height={10} rx={4} fill={shirtColor} />
          <Rect x={bodyX + bodyW - 22} y={126} width={14} height={10} rx={4} fill={shirtColor} />
        </G>
      )}

      {/* Male button placket */}
      {gender === 'male' && shirtStyle === 0 && (
        <Line x1={100} y1={148} x2={100} y2={208} stroke={collarDark} strokeWidth={1.5} />
      )}
    </G>
  );
}

// ── Arms & Hands ───────────────────────────────────────────────────────────────
function Arms({ skinTone }: { skinTone: string }) {
  const armShadow = hexToRgba(darken(skinTone, 0.2), 0.45);
  return (
    <G>
      {/* Left arm */}
      <Rect x={30} y={138} width={22} height={60} rx={11} fill={skinTone} />
      {/* Right arm */}
      <Rect x={148} y={138} width={22} height={60} rx={11} fill={skinTone} />
      {/* Arm inner shadow */}
      <Rect x={44} y={142} width={8} height={52} rx={4} fill={armShadow} />
      <Rect x={148} y={142} width={8} height={52} rx={4} fill={armShadow} />
      {/* Left hand */}
      <Circle cx={41} cy={202} r={12} fill={skinTone} />
      {/* Right hand */}
      <Circle cx={159} cy={202} r={12} fill={skinTone} />
      {/* Hand knuckle lines */}
      <Line x1={36} y1={198} x2={46} y2={198} stroke={darken(skinTone, 0.12)} strokeWidth={1} />
      <Line x1={154} y1={198} x2={164} y2={198} stroke={darken(skinTone, 0.12)} strokeWidth={1} />
    </G>
  );
}

// ── Neck ───────────────────────────────────────────────────────────────────────
function Neck({ skinTone }: { skinTone: string }) {
  return (
    <G>
      <Rect x={88} y={118} width={24} height={22} rx={8} fill={skinTone} />
      <Rect x={94} y={118} width={8} height={22} rx={4} fill={hexToRgba(darken(skinTone, 0.12), 0.5)} />
    </G>
  );
}

// ── Head ───────────────────────────────────────────────────────────────────────
function Head({ skinTone }: { skinTone: string }) {
  const jawShadow = hexToRgba(darken(skinTone, 0.18), 0.5);
  return (
    <G>
      {/* Main head */}
      <Ellipse cx={100} cy={88} rx={52} ry={58} fill={skinTone} />
      {/* Jaw shadow */}
      <Ellipse cx={100} cy={128} rx={38} ry={14} fill={jawShadow} />
      {/* Side depth shadow */}
      <Ellipse cx={140} cy={88} rx={16} ry={48} fill={hexToRgba(darken(skinTone, 0.1), 0.3)} />
      {/* Cheek blush left */}
      <Ellipse cx={68} cy={100} rx={10} ry={6} fill="#FF9999" opacity={0.28} />
      {/* Cheek blush right */}
      <Ellipse cx={132} cy={100} rx={10} ry={6} fill="#FF9999" opacity={0.28} />
    </G>
  );
}

// ── Ears ───────────────────────────────────────────────────────────────────────
function Ears({ skinTone }: { skinTone: string }) {
  const innerEar = darken(skinTone, 0.12);
  return (
    <G>
      <Ellipse cx={48} cy={90} rx={10} ry={13} fill={skinTone} />
      <Ellipse cx={48} cy={90} rx={6} ry={8} fill={innerEar} />
      <Ellipse cx={152} cy={90} rx={10} ry={13} fill={skinTone} />
      <Ellipse cx={152} cy={90} rx={6} ry={8} fill={innerEar} />
    </G>
  );
}

// ── Hair ───────────────────────────────────────────────────────────────────────
function MaleHair({ hairStyle, hairColor }: { hairStyle: number; hairColor: string }) {
  const highlight = hexToRgba(lighten(hairColor, 0.35), 0.55);
  const dark = darken(hairColor, 0.2);

  if (hairStyle === 4) {
    // Bald — subtle shine
    return (
      <G>
        <Ellipse cx={85} cy={48} rx={18} ry={10} fill="rgba(255,255,255,0.08)" />
      </G>
    );
  }

  if (hairStyle === 0) {
    // Buzz cut
    return (
      <G>
        <Ellipse cx={100} cy={44} rx={52} ry={22} fill={hairColor} />
        <Rect x={48} y={44} width={10} height={30} rx={5} fill={hairColor} />
        <Rect x={142} y={44} width={10} height={30} rx={5} fill={hairColor} />
        <Ellipse cx={82} cy={42} rx={10} ry={5} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 1) {
    // Side part
    return (
      <G>
        <Path
          d="M 48 88 Q 48 30 100 30 Q 152 30 152 88 Q 148 60 100 58 Q 60 56 52 88 Z"
          fill={hairColor}
        />
        {/* Side part line */}
        <Path d="M 78 30 Q 76 50 74 68" stroke={dark} strokeWidth={2} fill="none" />
        {/* Swept left section */}
        <Path d="M 48 70 Q 55 50 78 44 Q 68 60 62 78 Z" fill={dark} />
        <Ellipse cx={82} cy={38} rx={8} ry={4} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 2) {
    // Curly
    return (
      <G>
        {/* Base cap */}
        <Path
          d="M 48 88 Q 48 30 100 30 Q 152 30 152 88 Q 148 55 100 52 Q 52 55 48 88 Z"
          fill={hairColor}
        />
        {/* Curly bumps */}
        <Circle cx={68} cy={46} r={14} fill={hairColor} />
        <Circle cx={88} cy={36} r={14} fill={hairColor} />
        <Circle cx={112} cy={36} r={14} fill={hairColor} />
        <Circle cx={132} cy={46} r={14} fill={hairColor} />
        <Circle cx={78} cy={40} r={10} fill={dark} />
        <Circle cx={100} cy={32} r={10} fill={dark} />
        <Circle cx={122} cy={40} r={10} fill={dark} />
        <Ellipse cx={82} cy={36} rx={7} ry={4} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 3) {
    // Mohawk
    return (
      <G>
        {/* Shaved sides */}
        <Ellipse cx={62} cy={72} rx={16} ry={28} fill={darken('#FDDBB4', 0.08)} opacity={0.4} />
        <Ellipse cx={138} cy={72} rx={16} ry={28} fill={darken('#FDDBB4', 0.08)} opacity={0.4} />
        {/* Mohawk strip */}
        <Rect x={92} y={10} width={16} height={62} rx={8} fill={hairColor} />
        <Rect x={95} y={12} width={6} height={58} rx={3} fill={highlight} />
      </G>
    );
  }

  return null;
}

function FemaleHair({ hairStyle, hairColor }: { hairStyle: number; hairColor: string }) {
  const highlight = hexToRgba(lighten(hairColor, 0.35), 0.55);
  const dark = darken(hairColor, 0.18);

  if (hairStyle === 0) {
    // Long straight
    return (
      <G>
        {/* Top cap */}
        <Path
          d="M 48 88 Q 48 28 100 28 Q 152 28 152 88 Q 148 52 100 50 Q 52 52 48 88 Z"
          fill={hairColor}
        />
        {/* Left flowing strand */}
        <Path d="M 48 80 Q 36 120 38 180 Q 42 200 50 210 Q 44 180 46 140 Q 48 110 52 90 Z" fill={hairColor} />
        {/* Right flowing strand */}
        <Path d="M 152 80 Q 164 120 162 180 Q 158 200 150 210 Q 156 180 154 140 Q 152 110 148 90 Z" fill={hairColor} />
        {/* Center part */}
        <Path d="M 100 28 L 100 52" stroke={dark} strokeWidth={2} fill="none" />
        <Ellipse cx={82} cy={36} rx={10} ry={5} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 1) {
    // Bob
    return (
      <G>
        <Path
          d="M 48 88 Q 48 28 100 28 Q 152 28 152 88 Q 152 130 140 138 Q 120 148 100 148 Q 80 148 60 138 Q 48 130 48 88 Z"
          fill={hairColor}
        />
        <Path d="M 100 28 L 100 52" stroke={dark} strokeWidth={1.5} fill="none" />
        <Ellipse cx={82} cy={36} rx={10} ry={5} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 2) {
    // Curly / fluffy
    return (
      <G>
        <Path
          d="M 48 88 Q 48 28 100 28 Q 152 28 152 88 Q 148 55 100 52 Q 52 55 48 88 Z"
          fill={hairColor}
        />
        {/* Fluffy bumps */}
        <Circle cx={60} cy={52} r={16} fill={hairColor} />
        <Circle cx={80} cy={36} r={16} fill={hairColor} />
        <Circle cx={100} cy={30} r={16} fill={hairColor} />
        <Circle cx={120} cy={36} r={16} fill={hairColor} />
        <Circle cx={140} cy={52} r={16} fill={hairColor} />
        {/* Side volume */}
        <Circle cx={46} cy={80} r={14} fill={hairColor} />
        <Circle cx={154} cy={80} r={14} fill={hairColor} />
        <Ellipse cx={82} cy={34} rx={8} ry={5} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 3) {
    // Ponytail
    return (
      <G>
        {/* Top cap */}
        <Path
          d="M 48 88 Q 48 28 100 28 Q 152 28 152 88 Q 148 52 100 50 Q 52 52 48 88 Z"
          fill={hairColor}
        />
        {/* Ponytail */}
        <Rect x={144} y={72} width={18} height={60} rx={9} fill={hairColor} />
        <Rect x={148} y={74} width={6} height={56} rx={3} fill={highlight} />
        {/* Hair tie */}
        <Rect x={142} y={96} width={22} height={8} rx={4} fill={dark} />
        <Ellipse cx={82} cy={36} rx={10} ry={5} fill={highlight} />
      </G>
    );
  }

  if (hairStyle === 4) {
    // Braids
    return (
      <G>
        {/* Top cap */}
        <Path
          d="M 48 88 Q 48 28 100 28 Q 152 28 152 88 Q 148 52 100 50 Q 52 52 48 88 Z"
          fill={hairColor}
        />
        {/* Left braid */}
        <Rect x={38} y={90} width={16} height={100} rx={8} fill={hairColor} />
        <Rect x={40} y={92} width={5} height={96} rx={2.5} fill={highlight} />
        {/* Braid segments left */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={i} x={36} y={100 + i * 18} width={20} height={6} rx={3} fill={dark} />
        ))}
        {/* Right braid */}
        <Rect x={146} y={90} width={16} height={100} rx={8} fill={hairColor} />
        <Rect x={155} y={92} width={5} height={96} rx={2.5} fill={highlight} />
        {/* Braid segments right */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={i} x={144} y={100 + i * 18} width={20} height={6} rx={3} fill={dark} />
        ))}
        <Ellipse cx={82} cy={36} rx={10} ry={5} fill={highlight} />
      </G>
    );
  }

  return null;
}

// ── Eyebrows ───────────────────────────────────────────────────────────────────
function Eyebrows({
  eyebrowStyle,
  hairColor,
}: {
  eyebrowStyle: number;
  hairColor: string;
}) {
  const browColor = darken(hairColor, 0.08);
  const thicknesses = [5, 4, 7, 6, 8];
  const h = thicknesses[eyebrowStyle] ?? 5;
  const rotations = [-5, -8, -3, -6, -2];
  const rot = rotations[eyebrowStyle] ?? -5;

  return (
    <G>
      {/* Left brow */}
      <Rect
        x={66}
        y={62}
        width={26}
        height={h}
        rx={h / 2}
        fill={browColor}
        transform={`rotate(${rot}, 79, 64)`}
      />
      {/* Right brow */}
      <Rect
        x={108}
        y={62}
        width={26}
        height={h}
        rx={h / 2}
        fill={browColor}
        transform={`rotate(${-rot}, 121, 64)`}
      />
    </G>
  );
}

// ── Eyes ───────────────────────────────────────────────────────────────────────
function Eyes({
  eyeStyle,
  eyelashStyle,
  skinTone,
  gender,
}: {
  eyeStyle: number;
  eyelashStyle: number;
  skinTone: string;
  gender: 'male' | 'female';
}) {
  const irisColor = EYE_COLORS[eyeStyle] ?? EYE_COLORS[0];
  const lidColor = darken(skinTone, 0.28);
  const lashCount = gender === 'female' ? eyelashStyle * 2 : 0;

  const renderLashes = (cx: number, cy: number, side: 1 | -1) => {
    if (lashCount === 0) return null;
    const lashes = [];
    for (let i = 0; i < lashCount; i++) {
      const angle = -90 + (i - lashCount / 2 + 0.5) * (80 / lashCount);
      const rad = (angle * Math.PI) / 180;
      const x1 = cx + 12 * Math.cos(rad);
      const y1 = cy + 9 * Math.sin(rad);
      const x2 = cx + (12 + 5 + eyelashStyle) * Math.cos(rad);
      const y2 = cy + (9 + 5 + eyelashStyle) * Math.sin(rad);
      lashes.push(
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1A1A1A" strokeWidth={1.5} strokeLinecap="round" />
      );
    }
    return lashes;
  };

  return (
    <G>
      {/* Eye whites */}
      <Ellipse cx={78} cy={80} rx={13} ry={10} fill="white" />
      <Ellipse cx={122} cy={80} rx={13} ry={10} fill="white" />

      {/* Iris */}
      <Circle cx={78} cy={81} r={7} fill={irisColor} />
      <Circle cx={122} cy={81} r={7} fill={irisColor} />

      {/* Pupil */}
      <Circle cx={79} cy={82} r={4} fill="#0A0A0A" />
      <Circle cx={123} cy={82} r={4} fill="#0A0A0A" />

      {/* Eye shine */}
      <Circle cx={81} cy={79} r={2} fill="white" />
      <Circle cx={125} cy={79} r={2} fill="white" />

      {/* Eyelid line */}
      <Path d="M 65 76 Q 78 70 91 76" stroke={lidColor} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M 109 76 Q 122 70 135 76" stroke={lidColor} strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* Female lashes */}
      {renderLashes(78, 80, 1)}
      {renderLashes(122, 80, -1)}
    </G>
  );
}

// ── Nose ───────────────────────────────────────────────────────────────────────
function Nose({ noseStyle, skinTone }: { noseStyle: number; skinTone: string }) {
  const nostrilColor = darken(skinTone, 0.18);
  const sizes = [4, 5, 3.5, 4.5, 3];
  const r = sizes[noseStyle] ?? 4;
  const yOffsets = [0, 1, -1, 0, -2];
  const y = 98 + (yOffsets[noseStyle] ?? 0);

  return (
    <G>
      <Circle cx={94} cy={y} r={r} fill={nostrilColor} />
      <Circle cx={106} cy={y} r={r} fill={nostrilColor} />
      {/* Bridge */}
      <Path
        d={`M 97 ${y - 2} Q 100 ${y - 8} 103 ${y - 2}`}
        stroke={darken(skinTone, 0.1)}
        strokeWidth={1.2}
        fill="none"
      />
    </G>
  );
}

// ── Mouth ──────────────────────────────────────────────────────────────────────
function Mouth({ mouthStyle }: { mouthStyle: number }) {
  if (mouthStyle === 0) {
    // Smile
    return (
      <Path
        d="M 84 112 Q 100 124 116 112"
        stroke="#CC4444"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (mouthStyle === 1) {
    // Big smile with teeth
    return (
      <G>
        <Path d="M 82 110 Q 100 126 118 110" stroke="#CC4444" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M 84 112 Q 100 124 116 112 L 116 118 Q 100 120 84 118 Z" fill="white" />
        <Line x1={100} y1={112} x2={100} y2={118} stroke="#DDAAAA" strokeWidth={1} />
      </G>
    );
  }
  if (mouthStyle === 2) {
    // Smirk
    return (
      <Path
        d="M 86 114 Q 96 120 112 110"
        stroke="#CC4444"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (mouthStyle === 3) {
    // Neutral
    return (
      <Path
        d="M 86 114 Q 100 116 114 114"
        stroke="#CC4444"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (mouthStyle === 4) {
    // Grin with teeth
    return (
      <G>
        <Path d="M 80 110 Q 100 128 120 110" stroke="#CC4444" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M 82 112 Q 100 126 118 112 L 118 120 Q 100 122 82 120 Z" fill="white" />
        <Line x1={91} y1={112} x2={91} y2={120} stroke="#DDAAAA" strokeWidth={1} />
        <Line x1={100} y1={112} x2={100} y2={120} stroke="#DDAAAA" strokeWidth={1} />
        <Line x1={109} y1={112} x2={109} y2={120} stroke="#DDAAAA" strokeWidth={1} />
      </G>
    );
  }
  return null;
}

// ── Facial Hair ────────────────────────────────────────────────────────────────
function FacialHair({ facialHairStyle, hairColor }: { facialHairStyle: number; hairColor: string }) {
  if (facialHairStyle === 0) return null;

  const stubbleColor = hexToRgba(darken(hairColor, 0.05), 0.55);

  if (facialHairStyle === 1) {
    // Stubble dots
    const dots = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        dots.push(
          <Circle
            key={`${row}-${col}`}
            cx={76 + col * 7}
            cy={108 + row * 6}
            r={1.5}
            fill={stubbleColor}
          />
        );
      }
    }
    return <G>{dots}</G>;
  }

  if (facialHairStyle === 2) {
    // Mustache
    return (
      <Path
        d="M 82 108 Q 91 103 100 106 Q 109 103 118 108 Q 109 112 100 109 Q 91 112 82 108 Z"
        fill={hairColor}
      />
    );
  }

  if (facialHairStyle === 3) {
    // Goatee
    return (
      <G>
        <Path
          d="M 82 108 Q 91 103 100 106 Q 109 103 118 108 Q 109 112 100 109 Q 91 112 82 108 Z"
          fill={hairColor}
        />
        <Path
          d="M 90 118 Q 100 130 110 118 Q 106 136 100 138 Q 94 136 90 118 Z"
          fill={hairColor}
        />
      </G>
    );
  }

  if (facialHairStyle === 4) {
    // Full beard
    return (
      <Path
        d="M 60 100 Q 58 130 68 142 Q 80 152 100 154 Q 120 152 132 142 Q 142 130 140 100 Q 130 110 100 112 Q 70 110 60 100 Z"
        fill={hairColor}
        opacity={0.92}
      />
    );
  }

  return null;
}

// ── Hair Overlay (front bangs) ─────────────────────────────────────────────────
function HairOverlay({ hairStyle, hairColor, gender }: { hairStyle: number; hairColor: string; gender: 'male' | 'female' }) {
  const dark = darken(hairColor, 0.15);

  if (gender === 'male') {
    if (hairStyle === 1) {
      // Side part bangs
      return (
        <Path
          d="M 48 72 Q 55 58 72 56 Q 68 68 64 80 Z"
          fill={dark}
        />
      );
    }
    return null;
  }

  // Female
  if (hairStyle === 0) {
    // Long straight bangs
    return (
      <G>
        <Path d="M 60 50 Q 64 62 62 76 Q 56 68 54 56 Z" fill={dark} />
        <Path d="M 140 50 Q 136 62 138 76 Q 144 68 146 56 Z" fill={dark} />
      </G>
    );
  }
  if (hairStyle === 1) {
    // Bob front strands
    return (
      <G>
        <Path d="M 58 60 Q 62 72 60 86 Q 54 76 54 64 Z" fill={dark} />
        <Path d="M 142 60 Q 138 72 140 86 Q 146 76 146 64 Z" fill={dark} />
      </G>
    );
  }
  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ChibiAvatar({ avatarData, size = 200 }: ChibiAvatarProps) {
  console.log('[ChibiAvatar] Rendering avatar', { gender: avatarData.gender, size });

  const shirtColor = SHIRT_COLORS[avatarData.shirtStyle] ?? SHIRT_COLORS[0];
  const pantsColor = PANTS_COLORS[avatarData.pantsStyle] ?? PANTS_COLORS[0];
  const shoeColor = SHOE_COLORS[avatarData.shoeStyle] ?? SHOE_COLORS[0];

  const svgWidth = size;
  const svgHeight = size * 1.6;

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      viewBox="0 0 200 320"
    >
      <Defs>
        <RadialGradient id="headGrad" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor={lighten(avatarData.skinTone, 0.12)} />
          <Stop offset="100%" stopColor={avatarData.skinTone} />
        </RadialGradient>
      </Defs>

      {/* Layer 1: Shadow */}
      <Shadow />

      {/* Layer 2: Shoes */}
      <Shoes shoeStyle={avatarData.shoeStyle} shoeColor={shoeColor} />

      {/* Layer 3: Pants */}
      <Pants pantsStyle={avatarData.pantsStyle} pantsColor={pantsColor} />

      {/* Layer 4: Shirt */}
      <Shirt
        shirtStyle={avatarData.shirtStyle}
        shirtColor={shirtColor}
        skinTone={avatarData.skinTone}
        gender={avatarData.gender}
      />

      {/* Layer 5: Arms */}
      <Arms skinTone={avatarData.skinTone} />

      {/* Layer 6: Neck */}
      <Neck skinTone={avatarData.skinTone} />

      {/* Layer 7: Ears */}
      <Ears skinTone={avatarData.skinTone} />

      {/* Layer 8: Head */}
      <Head skinTone={avatarData.skinTone} />

      {/* Layer 9: Hair (back) */}
      {avatarData.gender === 'male' ? (
        <MaleHair hairStyle={avatarData.hairStyle} hairColor={avatarData.hairColor} />
      ) : (
        <FemaleHair hairStyle={avatarData.hairStyle} hairColor={avatarData.hairColor} />
      )}

      {/* Layer 10: Face features */}
      <Eyebrows eyebrowStyle={avatarData.eyebrowStyle} hairColor={avatarData.hairColor} />
      <Eyes
        eyeStyle={avatarData.eyeStyle}
        eyelashStyle={avatarData.eyelashStyle}
        skinTone={avatarData.skinTone}
        gender={avatarData.gender}
      />
      <Nose noseStyle={avatarData.noseStyle} skinTone={avatarData.skinTone} />
      <Mouth mouthStyle={avatarData.mouthStyle} />

      {/* Facial hair (male only) */}
      {avatarData.gender === 'male' && (
        <FacialHair facialHairStyle={avatarData.facialHairStyle} hairColor={avatarData.hairColor} />
      )}

      {/* Layer 11: Hair overlay / front bangs */}
      <HairOverlay
        hairStyle={avatarData.hairStyle}
        hairColor={avatarData.hairColor}
        gender={avatarData.gender}
      />
    </Svg>
  );
}
