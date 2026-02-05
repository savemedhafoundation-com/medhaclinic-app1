import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  Image,
  ImageBackground,
  PanResponder,
  PanResponderGestureState,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bgimage from '../assets/images/bg_pattern.png';
import family from '../assets/images/family.png';
import medha from '../assets/images/medha_logo.png';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const BUTTON_WIDTH = width * 0.8;
const BUTTON_HEIGHT = 56;
const KNOB_SIZE = 44;
const PADDING = 8;

const MAX_TRANSLATE = BUTTON_WIDTH - KNOB_SIZE - PADDING * 2;
const TRIGGER_AT = MAX_TRANSLATE * 0.75;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function WelcomeScreen() {
  const translateX = useRef(new Animated.Value(0)).current;
  const trackProgress = useRef(new Animated.Value(0)).current;
  const hintX = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  const hintLoop = useRef<Animated.CompositeAnimation | null>(null);
  const isNavigating = useRef(false);

  // 🌊 Ripple animation values
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  const startHint = () => {
    if (hintLoop.current) return;
    hintLoop.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(hintX, { toValue: 6, duration: 500, useNativeDriver: true }),
          Animated.timing(hintX, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(hintOpacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
          Animated.timing(hintOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
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

  // 🌊 Start ripple effect
  const startRipple = () => {
    const createRipple = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createRipple(ripple1, 0).start();
    createRipple(ripple2, 666).start();
    createRipple(ripple3, 1333).start();
  };

  useEffect(() => {
    startHint();
    startRipple();
    return () => {
      stopHint();
      ripple1.stopAnimation();
      ripple2.stopAnimation();
      ripple3.stopAnimation();
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => stopHint(),
        onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (isNavigating.current) return;
          const dx = Math.max(0, Math.min(gesture.dx, MAX_TRANSLATE));
          translateX.setValue(dx);
          trackProgress.setValue(dx / MAX_TRANSLATE);
        },
        onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
          if (isNavigating.current) return;
          const dx = Math.max(0, Math.min(gesture.dx, MAX_TRANSLATE));
          if (dx >= TRIGGER_AT) {
            isNavigating.current = true;
            Animated.parallel([
              Animated.timing(translateX, { toValue: MAX_TRANSLATE, duration: 180, useNativeDriver: true }),
              Animated.timing(trackProgress, { toValue: 1, duration: 180, useNativeDriver: false }),
            ]).start(() => router.replace('/Loginscreen'));
          } else {
            Animated.parallel([
              Animated.spring(translateX, { toValue: 0, friction: 7, tension: 90, useNativeDriver: true }),
              Animated.timing(trackProgress, { toValue: 0, duration: 200, useNativeDriver: false }),
            ]).start(startHint);
          }
        },
      }),
    []
  );

  const trackStartColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.18)', 'rgba(24,200,120,0.85)'],
  });

  const trackEndColor = trackProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.18)', 'rgba(12,160,95,0.85)'],
  });

  // 🌊 Ripple interpolation
  const rippleScale1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const rippleOpacity1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
  const rippleScale2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const rippleOpacity2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
  const rippleScale3 = ripple3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const rippleOpacity3 = ripple3.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <ImageBackground source={bgimage} className="flex-1" resizeMode="cover">
      <LinearGradient 
        colors={['rgba(33,230,46,0.35)', 'rgba(27,156,113,0.35)']}
      
      
      style={{ flex: 1 }}
      
      
      >
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingVertical: isSmallDevice ? 24 : 20,
          }}
        >
          {/* LOGO */}
          <Image
            source={medha}
            style={{
              width: isSmallDevice ? 290 : 200,
              height: isSmallDevice ? 140 : 122,
            }}
            resizeMode="contain"
          />

          {/* CENTER IMAGE WITH RIPPLE EFFECT */}
          <View style={{ width: width * 0.65, height: width * 0.65, alignItems: 'center', justifyContent: 'center' }}>
            {/* 🌊 Ripple Rings */}
            <Animated.View
              style={{
                position: 'absolute',
                width: width * 0.52,
                height: width * 0.52,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: [{ scale: rippleScale1 }],
                opacity: rippleOpacity1,
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: width * 0.52,
                height: width * 0.52,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: [{ scale: rippleScale2 }],
                opacity: rippleOpacity2,
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: width * 0.52,
                height: width * 0.52,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: [{ scale: rippleScale3 }],
                opacity: rippleOpacity3,
              }}
            />

            {/* Static Background Rings */}
            <View
              style={{
                width: width * 0.65,
                height: width * 0.65,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: width * 0.52,
                  height: width * 0.52,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.28)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={family}
                  style={{
                    width: width * 0.42,
                    height: width * 0.42,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          </View>

          {/* TEXT */}
          <View className="items-center px-5">
            <Text className="text-white text-[18px]">Welcome to</Text>
            <Text className="text-white text-[30px] font-bold my-1">Medha Clinic</Text>
            <Text className="text-[#EAF2FF] text-[15px] text-center">Your Family&apos;s Health, Our Priority</Text>
          </View>

          {/* SWIPE TRACK */}
          <AnimatedLinearGradient
            colors={[trackStartColor, trackEndColor] as any}
            style={{
              width: BUTTON_WIDTH,
              height: BUTTON_HEIGHT,
              borderRadius: BUTTON_HEIGHT / 2,
              paddingHorizontal: 8,
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <Text className="absolute self-center text-white text-[16px] font-medium">Swipe to Start</Text>
            <Animated.View style={{ transform: [{ translateX: hintX }], opacity: hintOpacity }}>
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  width: KNOB_SIZE,
                  height: KNOB_SIZE,
                  borderRadius: KNOB_SIZE / 2,
                  backgroundColor: '#1c6f15d1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ translateX }],
                }}
              >
                <Text className="text-white text-[26px] font-bold">{'>'}</Text>
              </Animated.View>
            </Animated.View>
          </AnimatedLinearGradient>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}