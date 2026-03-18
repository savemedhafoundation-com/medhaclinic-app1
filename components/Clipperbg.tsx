import React from 'react';
import { useWindowDimensions, Image, View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface Props {
  height?: number;
}

function SvgHeader({ height = 180 }: Props) {
  const { width } = useWindowDimensions();
  const W = 842;
  const H = 347;

  // ── Body: pixel-accurate wave from image scan ─────────────────────────
  // Trough: x≈200,y=248 | Peak: x≈630,y=319 | Right end: x=836,y=255
  const body = [
    `M 0,0`,
    `L ${W},0`,
    `L ${W},255`,
    `C 820,262 800,272 780,283`,
    `C 760,293 740,301 720,308`,
    `C 700,313 680,317 660,319`,
    `C 640,319 620,319 600,318`,
    `C 570,316 540,310 510,305`,
    `C 480,299 450,291 420,282`,
    `C 390,273 360,264 330,258`,
    `C 300,253 270,250 240,248`,
    `C 215,247 195,248 175,249`,
    `C 150,251 125,255 100,261`,
    `C 75,267 55,275 35,285`,
    `C 20,292 10,298 0,304`,
    'Z',
  ].join(' ');

  // ── Wave edge path (same coords — guarantees zero gap) ────────────────
  const wavePath = [
    `M 0,304`,
    `C 10,298 20,292 35,285`,
    `C 55,275 75,267 100,261`,
    `C 125,255 150,251 175,249`,
    `C 195,248 215,247 240,248`,
    `C 270,250 300,253 330,258`,
    `C 360,264 390,273 420,282`,
    `C 450,291 480,299 510,305`,
    `C 540,310 570,316 600,318`,
    `C 620,319 640,319 660,319`,
    `C 680,317 700,313 720,308`,
    `C 740,301 760,293 780,283`,
    `C 800,272 820,262 ${W},255`,
  ].join(' ');

  return (
    <View style={{ width, height, backgroundColor: "transparent" }}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ backgroundColor: 'transparent' }}
      >
        <Defs>

          {/* ── Body gradient: bright lime top → deep forest green bottom ── */}
          <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="#30C418" stopOpacity="1" />
            <Stop offset="30%"  stopColor="#27A815" stopOpacity="1" />
            <Stop offset="60%"  stopColor="#18800E" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0E5008" stopOpacity="1" />
          </LinearGradient>

          {/* ── Subtle left brightness overlay ── */}
          <LinearGradient id="edgeLight" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"  stopColor="#49B636" stopOpacity="0.3" />
            <Stop offset="8%"  stopColor="#30C418" stopOpacity="0"   />
            <Stop offset="92%" stopColor="#30C418" stopOpacity="0"   />
            <Stop offset="100%" stopColor="#28A010" stopOpacity="0.12" />
          </LinearGradient>

          {/* ── Stroke gradient 1: #1DB206 (brighter) fades out right ── */}
          <LinearGradient id="stroke1" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#1DB206" stopOpacity="1"   />
            <Stop offset="40%"  stopColor="#1DB206" stopOpacity="1"   />
            <Stop offset="75%"  stopColor="#1DB206" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#1DB206" stopOpacity="0"   />
          </LinearGradient>

          {/* ── Stroke gradient 2: #1AA006 (deeper) fades out right ── */}
          <LinearGradient id="stroke2" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#1AA006" stopOpacity="1"   />
            <Stop offset="40%"  stopColor="#1AA006" stopOpacity="1"   />
            <Stop offset="75%"  stopColor="#1AA006" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#1AA006" stopOpacity="0"   />
          </LinearGradient>

        </Defs>

        {/* ── Green body ── */}
        <Path d={body} fill="url(#bodyGrad)" />

        {/* ── Edge brightness ── */}
        <Path d={body} fill="url(#edgeLight)" />

        {/* ── Stroke layer 1: #1DB206 wide soft base ── */}
        <Path
          d={wavePath}
          fill="none"
          stroke="url(#stroke1)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />

        {/* ── Stroke layer 2: #1AA006 crisp thin top line ── */}
        <Path
          d={wavePath}
          fill="none"
          stroke="url(#stroke2)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={1}
        />

      </Svg>

      {/* ── Medha Clinic Logo — centered ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../assets/images/medha_logo.png')}
            style={{ width: 160, height: 120 }}
            resizeMode="none"
          />
        </View>
      </View>
    </View>
  );
}

export default SvgHeader;