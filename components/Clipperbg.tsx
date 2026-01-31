import React from 'react';
import Svg, {
  G,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from 'react-native-svg';

export default function SvgHeader() {
  return (
    <Svg
      width="100%"
      height={190}
      viewBox="0 0 393 190"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient
          id="paint0_linear"
          x1="383"
          y1="86.5"
          x2="432"
          y2="194.5"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1398E9" />
          <Stop offset="1" stopColor="white" />
        </LinearGradient>

        <LinearGradient
          id="paint1_linear"
          x1="383"
          y1="67.5"
          x2="432"
          y2="175.5"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1398E9" />
          <Stop offset="1" stopColor="white" />
        </LinearGradient>

        <LinearGradient
          id="paint2_linear"
          x1="57.3222"
          y1="125.439"
          x2="93.8"
          y2="205.839"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1398E9" />
          <Stop offset="1" stopColor="white" />
        </LinearGradient>

        <LinearGradient
          id="paint3_linear"
          x1="57.3222"
          y1="125.439"
          x2="93.8"
          y2="205.839"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1398E9" />
          <Stop offset="1" stopColor="white" />
        </LinearGradient>

        <ClipPath id="clip0">
          <Rect width="393" height="190" fill="white" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip0)">
        {/* Main Wave */}
        <Path
          d="M0 0H393V186.507C393 186.507 364.75 153.676 307 176.337C249.25 198.997 245 159.515 209 176.337C173 193.158 152 145.594 98.25 176.337C44.5 207.079 0 176.337 0 176.337V0Z"
          fill="#2089F9"
        />

        {/* Right Gradient Circles */}
        <G opacity={0.15}>
          <Circle
            cx="431.5"
            cy="43.5"
            r="125.5"
            fill="url(#paint0_linear)"
            opacity={0.44}
          />
          <Circle
            cx="431.5"
            cy="24.5"
            r="125.5"
            fill="url(#paint1_linear)"
          />
        </G>

        {/* Left Gradient Circles */}
        <G opacity={0.15}>
          <Circle
            cx="93.4278"
            cy="93.4278"
            r="93.4278"
            transform="matrix(-0.220044 0.97549 0.97549 0.220044 -90.0857 -73.8876)"
            fill="url(#paint2_linear)"
            opacity={0.44}
          />
          <Circle
            cx="93.4278"
            cy="93.4278"
            r="93.4278"
            transform="matrix(-0.220044 0.97549 0.97549 0.220044 -103.884 -76.9999)"
            fill="url(#paint3_linear)"
          />
        </G>
      </G>
    </Svg>
  );
}
