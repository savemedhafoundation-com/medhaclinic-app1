import React from 'react';
import { View, Image } from 'react-native';
import Svg, {
  G, Path, Circle, Defs, LinearGradient, Stop, ClipPath, Rect,
} from 'react-native-svg';

import logo from '../assets/images/medha_logo.png';

export default function SvgHeader() {
  const SVG_WIDTH = 393;
  const SVG_HEIGHT = 250;
  
  // Logo dimensions - INCREASED SIZE
  const LOGO_WIDTH = 220;  // 🔼 Increased from 170
  const LOGO_HEIGHT = 360; // 🔼 Increased from 380 (maintains aspect ratio ~1:2.24)

  // Recalculate center position
  const logoX = (SVG_WIDTH - LOGO_WIDTH) / 2; // (393 - 250) / 2 = 71.5
  const logoY = (SVG_HEIGHT - LOGO_HEIGHT) / 2; // (200 - 560) / 2 = -180

  return (
    <View style={{ 
      position: 'relative', 
      height: 245, 
      width: '100%',
      overflow: 'visible' // Allow logo to extend beyond
    }}>
      <Svg
        width="100%"
        height={245}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute' }}
      >
        <Defs>
          <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1fd35a" />
            <Stop offset="100%" stopColor="#0f9f3a" />
          </LinearGradient>
          <LinearGradient id="paint0_linear" x1="383" y1="86.5" x2="432" y2="194.5">
            <Stop stopColor="#11cb7e" />
            <Stop offset="1" stopColor="white" />
          </LinearGradient>
          <LinearGradient id="paint1_linear" x1="383" y1="67.5" x2="432" y2="175.5">
            <Stop stopColor="#12ca74" />
            <Stop offset="1" stopColor="white" />
          </LinearGradient>
          <LinearGradient id="paint2_linear" x1="57.3222" y1="125.439" x2="93.8" y2="205.839">
            <Stop stopColor="#1bc712" />
            <Stop offset="1" stopColor="white" />
          </LinearGradient>
          <LinearGradient id="paint3_linear" x1="57.3222" y1="125.439" x2="93.8" y2="205.839">
            <Stop stopColor="#0fbb12" />
            <Stop offset="1" stopColor="white" />
          </LinearGradient>
          <ClipPath id="clip0">
            <Rect width="393" height="190" fill="white" />
          </ClipPath>
        </Defs>

        <G clipPath="url(#clip0)">
          <Path
            d="M0 0H393V186.507C393 186.507 364.75 153.676 307 176.337C249.25 198.997 245 159.515 209 176.337C173 193.158 152 145.594 98.25 176.337C44.5 207.079 0 176.337 0 176.337V0Z"
            fill="url(#bgGradient)"
          />
          <G opacity={0.15}>
            <Circle cx="431.5" cy="43.5" r="125.5" fill="url(#paint0_linear)" opacity={0.44} />
            <Circle cx="431.5" cy="24.5" r="125.5" fill="url(#paint1_linear)" />
          </G>
          <G opacity={0.15}>
            <Circle cx="93.4278" cy="93.4278" r="93.4278" transform="matrix(-0.220044 0.97549 0.97549 0.220044 -90.0857 -73.8876)" fill="url(#paint2_linear)" opacity={0.44} />
            <Circle cx="93.4278" cy="93.4278" r="93.4278" transform="matrix(-0.220044 0.97549 0.97549 0.220044 -103.884 -76.9999)" fill="url(#paint3_linear)" />
          </G>
        </G>
      </Svg>

      {/* 🔰 LOGO - CENTERED AND LARGER */}
      <Image
        source={logo}
        style={{
          position: 'absolute',
          left: logoX,      // 71.5 - centered horizontally
          top: logoY-40,       // -180 - extends above and below
          width: LOGO_WIDTH,  // 250px wide
          height: LOGO_HEIGHT, // 560px tall
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}