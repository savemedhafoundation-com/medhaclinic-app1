import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type LiquidGlassSwipeButtonProps = {
  allowSwipe?: boolean;
  label?: string;
  loadingLabel?: string;
  width: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  onComplete?: () => void;
};

export default function LiquidGlassSwipeButton({
  allowSwipe = true,
  label = 'Swipe to Start',
  loadingLabel = 'Loading your experience...',
  width,
  height = 58,
  style,
  onComplete,
}: LiquidGlassSwipeButtonProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const trackProgress = useRef(new Animated.Value(0)).current;
  const hintX = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  const hintLoop = useRef<Animated.CompositeAnimation | null>(null);
  const isCompleting = useRef(false);

  const knobSize = Math.max(46, height - 10);
  const padding = Math.max(5, (height - knobSize) / 2);
  const maxTranslate = Math.max(0, width - knobSize - padding * 2);
  const triggerAt = maxTranslate * 0.75;

  const blurMethod = Platform.OS === 'android' ? 'dimezisBlurView' : 'none';
  const trackBlurTint = Platform.OS === 'ios' ? 'systemUltraThinMaterial' : 'default';
  const knobBlurTint = Platform.OS === 'ios' ? 'systemThinMaterial' : 'default';

  const startHint = () => {
    if (hintLoop.current || !allowSwipe) {
      return;
    }

    hintLoop.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(hintX, { toValue: 7, duration: 520, useNativeDriver: true }),
          Animated.timing(hintX, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(hintOpacity, { toValue: 0.78, duration: 520, useNativeDriver: true }),
          Animated.timing(hintOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        ]),
      ])
    );
    hintLoop.current.start();
  };

  const stopHint = () => {
    hintLoop.current?.stop();
    hintLoop.current = null;
    hintX.setValue(0);
    hintOpacity.setValue(1);
  };

  useEffect(() => {
    if (allowSwipe) {
      startHint();
    } else {
      stopHint();
      translateX.setValue(0);
      trackProgress.setValue(0);
      isCompleting.current = false;
    }

    return stopHint;
  }, [allowSwipe, hintOpacity, hintX, trackProgress, translateX]);

  const completeSwipe = () => {
    if (isCompleting.current) {
      return;
    }

    isCompleting.current = true;
    stopHint();

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: maxTranslate,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(trackProgress, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onComplete?.();
    });
  };

  const resetSwipe = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(trackProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      isCompleting.current = false;
      if (allowSwipe) {
        startHint();
      }
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => allowSwipe,
        onMoveShouldSetPanResponder: () => allowSwipe,
        onPanResponderGrant: () => stopHint(),
        onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (!allowSwipe || isCompleting.current) {
            return;
          }

          const dx = Math.max(0, Math.min(gesture.dx, maxTranslate));
          translateX.setValue(dx);
          trackProgress.setValue(maxTranslate === 0 ? 0 : dx / maxTranslate);
        },
        onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (!allowSwipe || isCompleting.current) {
            return;
          }

          const dx = Math.max(0, Math.min(gesture.dx, maxTranslate));
          if (dx >= triggerAt) {
            completeSwipe();
            return;
          }

          resetSwipe();
        },
        onPanResponderTerminate: () => {
          if (!allowSwipe || isCompleting.current) {
            return;
          }

          resetSwipe();
        },
      }),
    [allowSwipe, maxTranslate, trackProgress, translateX, triggerAt]
  );

  const trackStartColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(12,80,8,0.01)', 'rgba(34,146,24,0.09)'],
  });

  const trackEndColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(10,62,8,0.005)', 'rgba(22,112,16,0.12)'],
  });

  const fillWidth = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [knobSize + padding * 2, width],
  });

  const labelOpacity = trackProgress.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [1, 0.7, 0.2],
  });

  if (!allowSwipe) {
    return (
      <View style={[styles.container, { width, height, borderRadius: height / 2 }, style]}>
        <BlurView
          intensity={14}
          tint={trackBlurTint}
          experimentalBlurMethod={blurMethod}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['rgba(41,130,29,0.12)', 'rgba(8,60,6,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.trackBorder} />
        <Text style={styles.loadingText}>{loadingLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height, borderRadius: height / 2 }, style]}>
      <BlurView
        intensity={16}
        tint={trackBlurTint}
        experimentalBlurMethod={blurMethod}
        style={StyleSheet.absoluteFillObject}
      />

      <LinearGradient
        colors={['rgba(35,126,26,0.12)', 'rgba(7,58,5,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <AnimatedLinearGradient
        colors={[trackStartColor, trackEndColor] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.progressFill,
          {
            width: fillWidth,
            height: height - padding * 2,
            left: padding,
            top: padding,
            borderRadius: (height - padding * 2) / 2,
          },
        ]}
      />

      <View style={styles.trackBorder} />
      <View style={styles.bottomTint} />

      <Animated.Text
        style={[
          styles.label,
          {
            opacity: labelOpacity,
          },
        ]}
      >
        {label}
      </Animated.Text>

      <Animated.View style={{ transform: [{ translateX: hintX }], opacity: hintOpacity }}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.knobShell,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              marginLeft: padding,
              marginTop: padding,
              marginBottom: 5,
              transform: [{ translateX }],
            },
          ]}
        >
          <BlurView
            intensity={20}
            tint={knobBlurTint}
            experimentalBlurMethod={blurMethod}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(37,174,23,0.98)', 'rgba(17,138,10,0.96)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.knobInnerRing} />
          <View style={styles.knobHighlight} />
          <MaterialIcons name="keyboard-arrow-right" size={30} style={styles.knobArrow} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#001200',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    backgroundColor: 'rgba(9,66,7,0.05)',
  },
  progressFill: {
    position: 'absolute',
    shadowColor: '#34cf23',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 0,
  },
  trackBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
  },
  bottomTint: {
    position: 'absolute',
    bottom: 6,
    left: 18,
    right: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
    textShadowColor: 'rgba(0,0,0,0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  knobShell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(27,145,13,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#34cf23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  knobInnerRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
  },
  knobHighlight: {
    position: 'absolute',
    top: 4,
    width: '72%',
    height: '38%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  knobArrow: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
