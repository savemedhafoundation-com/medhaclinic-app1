import React from 'react';
import { View, Image, useWindowDimensions } from 'react-native';
import Svg, {
  G,
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from 'react-native-svg';

import logo from '../assets/images/medha_logo.png';

export default function SvgHeader() {
  const { width } = useWindowDimensions();

  const HEADER_HEIGHT = 190;

  // Stable logo size (no growth)
  const LOGO_WIDTH = Math.min(width * 0.5, 220);
  const LOGO_HEIGHT = LOGO_WIDTH * 1.6;

  return (
    <View
      style={{
        height: HEADER_HEIGHT,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* ========== SVG BACKGROUND ========== */}
      <Svg
        width="100%"
        height={HEADER_HEIGHT}
        viewBox="0 0 393 250"
        preserveAspectRatio="none"
        style={{ position: 'absolute' }}
      >
        <Defs>
          <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1fd35a" />
            <Stop offset="100%" stopColor="#0f9f3a" />
          </LinearGradient>
          <ClipPath id="clip0">
            <Rect width="393" height="190" />
          </ClipPath>
        </Defs>

        <G clipPath="url(#clip0)">
          <Path
            d="M0 0H393V186.507C393 186.507 364.75 153.676 307 176.337C249.25 198.997 245 159.515 209 176.337C173 193.158 152 145.594 98.25 176.337C44.5 207.079 0 176.337 0 176.337V0Z"
            fill="url(#bgGradient)"
          />
        </G>
      </Svg>

      {/* ========== FLEX-CENTERED LOGO (KEY FIX) ========== */}
      <View
        style={{
          position: 'absolute',
          inset: 0,                 // top:0, bottom:0, left:0, right:0
          justifyContent: 'center', // 🔥 vertical centering
          alignItems: 'center',     // 🔥 horizontal centering
          pointerEvents: 'none',
        }}
      >
     <Image
  source={logo}
  resizeMode="contain"
  style={{
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    marginBottom: 50, // ✅ add margin bottom here
  }}
/>
      </View>
    </View>
  );
}
