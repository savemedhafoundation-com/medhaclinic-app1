import React, {
  useEffect,
  useRef,
} from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LiquidGlassSwipeButton from './ui/liquid-glass-swipe-button';

const bgimage = require('../assets/images/bg_pattern.png');
const family = require('../assets/images/family.png');
const medha = require('../assets/images/medha_logo.png');

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const BUTTON_WIDTH = width * 0.8;

type WelcomeScreenProps = {
  allowStart?: boolean;
  loadingLabel?: string;
  navigationTarget?: string;
};

export default function WelcomeScreen({
  allowStart = true,
  loadingLabel = 'Loading your experience...',
  navigationTarget = '/Loginscreen',
}: WelcomeScreenProps) {
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  const startRipple = () => {
    const createRipple = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    createRipple(ripple1, 0).start();
    createRipple(ripple2, 666).start();
    createRipple(ripple3, 1333).start();
  };

  useEffect(() => {
    startRipple();
    return () => {
      ripple1.stopAnimation();
      ripple2.stopAnimation();
      ripple3.stopAnimation();
    };
  }, [ripple1, ripple2, ripple3]);

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
          <Image
            source={medha}
            style={{
              width: isSmallDevice ? 290 : 200,
              height: isSmallDevice ? 140 : 122,
            }}
            resizeMode="contain"
          />

          <View
            style={{
              width: width * 0.65,
              height: width * 0.65,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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

          <View className="items-center px-5">
            <Text className="text-white text-[18px]">Welcome to</Text>
            <Text className="text-white text-[30px] font-bold my-1">Medha Clinic</Text>
            <Text className="text-[#EAF2FF] text-[15px] text-center">
              Your Family&apos;s Wellness, Our Priority
            </Text>
          </View>

          <LiquidGlassSwipeButton
            allowSwipe={allowStart}
            loadingLabel={loadingLabel}
            onComplete={() => router.replace(navigationTarget as never)}
            width={BUTTON_WIDTH}
            style={{
              marginBottom: allowStart ? 20 : 0,
              marginTop: allowStart ? 0 : 20,
            }}
          />
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
