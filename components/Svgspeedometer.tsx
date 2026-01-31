import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

/* ================= CONFIG ================= */
const MAX = 10;
const START_ANGLE = -180;
const END_ANGLE = 0;
const GAP = 3;
const DONUT_THICKNESS = 48;
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

function arcPath(cx: number, cy: number, r: number) {
  const start = polar(cx, cy, r, START_ANGLE);
  const end = polar(cx, cy, r, END_ANGLE);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/* ================= COMPONENT ================= */
export default function SvgSpeedometer({
  score = 0,
  size = 220,
}: {
  score?: number;
  size?: number;
}) {
  const value = clamp(Number(score) || 0, 0, MAX);

  const width = size;
  const height = width / 2 + 24;
  const cx = width / 2;
  const cy = height;
  const radius = (width - 28) / 2;

  const NEEDLE_LENGTH = radius - 10;
  const ARC_LENGTH = Math.PI * radius;

  const rotation = useRef(new Animated.Value(START_ANGLE)).current;
  const arcProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetAngle =
      START_ANGLE + (value / MAX) * (END_ANGLE - START_ANGLE);

    const targetArc = (value / MAX) * ARC_LENGTH;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: targetAngle + 8,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(rotation, {
          toValue: targetAngle,
          stiffness: 120,
          damping: 10,
          mass: 0.6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(arcProgress, {
        toValue: targetArc,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const rotate = rotation.interpolate({
    inputRange: [START_ANGLE, END_ANGLE],
    outputRange: [`${START_ANGLE}deg`, `${END_ANGLE}deg`],
  });

  return (
    <View style={styles.container}>
      <View style={{ width, height: height + 20 }}>
        <Svg width={width} height={height + 20}>
          {/* ===== SEMI-DONUT (INNER REDUCED) ===== */}
          <Path
            d={`
              M ${cx - radius} ${cy}
              A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}
              L ${cx + radius - DONUT_THICKNESS} ${cy}
              A ${radius - DONUT_THICKNESS} ${radius - DONUT_THICKNESS} 0 1 0 ${cx - radius + DONUT_THICKNESS} ${cy}
              Z
            `}
            fill="#CBEAFF"
          />

          {/* Background arc */}
          <Path
            d={arcPath(cx, cy, radius)}
            stroke="#D6E6F5"
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress arc (with gap) */}
          <AnimatedPath
            d={arcPath(cx, cy, radius - GAP)}
            stroke="#1E88E5"
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={Animated.subtract(
              ARC_LENGTH,
              arcProgress
            )}
          />

          {/* Centre pivot */}
          <Circle cx={cx} cy={cy} r={10} fill="#0B4F8A" />
          <Circle cx={cx} cy={cy} r={4} fill="#FFFFFF" />
        </Svg>

        {/* Needle (UNCHANGED) */}
        <Animated.View
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
              styles.triangleNeedle,
              { borderLeftWidth: NEEDLE_LENGTH },
            ]}
          />
        </Animated.View>
      </View>

      <Text style={styles.score}>{value}/10</Text>
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

  triangleNeedle: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 80,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#1E88E5",
    transform: [{ translateY: -6 }],
  },

  score: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E88E5",
    marginTop: 8,
  },
});
