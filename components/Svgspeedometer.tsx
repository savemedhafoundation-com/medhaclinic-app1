import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

/* ================= CONFIG ================= */
const MAX = 10;
const START_ANGLE = -180;
const END_ANGLE = 0;

const OUTER_STROKE = 20;
const BASE_ARC_STROKE = 14;     // secondary arc width
const PIVOT_RADIUS = 14;        // center circle radius
const BASE_ARC_OFFSET = 21;      // distance from pivot

/* ================= HELPERS ================= */
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcSegment(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y}
          A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/* ================= COMPONENT ================= */
export default function SvgSpeedometer({
  score = 0,
  size = 240,
}: {
  score?: number;
  size?: number;
}) {
  const value = clamp(score, 0, MAX);

  const width = size;
  const height = size / 2 + 28;
  const cx = width / 2;
  const cy = height;

  const outerRadius = (width - 32) / 2;

  /* 🔑 Secondary arc now sits at needle SOURCE */
  const baseArcRadius = PIVOT_RADIUS + BASE_ARC_OFFSET;

  /* 🔑 Longer needle */
  const NEEDLE_LENGTH = outerRadius - 12;

  /* ===== NEEDLE ANIMATION ===== */
  const rotation = useRef(new Animated.Value(START_ANGLE)).current;

  useEffect(() => {
    const angle =
      START_ANGLE + (value / MAX) * (END_ANGLE - START_ANGLE);

    Animated.sequence([
      Animated.timing(rotation, {
        toValue: angle + 6,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue: angle,
        stiffness: 120,
        damping: 10,
        mass: 0.6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  const rotate = rotation.interpolate({
    inputRange: [START_ANGLE, END_ANGLE],
    outputRange: [`${START_ANGLE}deg`, `${END_ANGLE}deg`],
  });

  return (
    <View style={styles.container}>
      <View style={{ width, height: height + 34 }}>
        <Svg width={width} height={height + 34}>
          {/* ===== GRADIENT DEFINITION ===== */}
          <Defs>
            <LinearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#DC2626" />
              <Stop offset="25%" stopColor="#F97316" />
              <Stop offset="50%" stopColor="#EAB308" />
              <Stop offset="75%" stopColor="#84CC16" />
              <Stop offset="100%" stopColor="#16A34A" />
            </LinearGradient>
          </Defs>

          {/* ===== OUTER RAINBOW GRADIENT ARC ===== */}
          <Path
            d={arcSegment(cx, cy, outerRadius, START_ANGLE, END_ANGLE)}
            stroke="url(#rainbowGradient)"
            strokeWidth={OUTER_STROKE}
            fill="none"
            strokeLinecap="round"
          />

          {/* ===== BASE ARC (AT NEEDLE SOURCE) ===== */}
          <Path
            d={arcSegment(cx, cy, baseArcRadius, START_ANGLE, END_ANGLE)}
            stroke="#86EFAC"
            strokeWidth={BASE_ARC_STROKE}
            fill="none"
            strokeLinecap="round"
          />

          {/* ===== CENTER PIVOT ===== */}
          <Circle cx={cx} cy={cy} r={PIVOT_RADIUS} fill="#14532D" />
          <Circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
        </Svg>

        {/* ===== LONG NEEDLE (CORRECTLY ALIGNED) ===== */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.needlePivot,
            {
              left: cx,
              top: cy,
              transform: [{ rotate }],
            },
          ]}
        >
          <View
            style={[
              styles.needle,
              {
                borderLeftWidth: NEEDLE_LENGTH,
                borderLeftColor: "#14532D",
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* ===== SCORE ===== */}
      <Text style={styles.score}>{value.toFixed(2)}/10</Text>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  needlePivot: {
    position: "absolute",
    width: 0,
    height: 0,
  },

  needle: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",

    /* 🔑 Base exactly at pivot */
    transform: [{ translateY: -6 }],
  },

  score: {
    fontSize: 22,
    fontWeight: "700",
    color: "#14532D",
    marginTop: 8,
  },
});