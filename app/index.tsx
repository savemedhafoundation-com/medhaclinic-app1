import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef } from 'react';
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

import { router } from 'expo-router';
import family from '../assets/images/family.png';
import medha from '../assets/images/medha_logo.png';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const BUTTON_WIDTH = width * 0.8;
const BUTTON_HEIGHT = 56;
const KNOB_SIZE = 44;
const PADDING = 8;

// max distance knob can travel
const MAX_TRANSLATE = BUTTON_WIDTH - KNOB_SIZE - PADDING * 2;

// how far user must swipe to trigger
const TRIGGER_AT = MAX_TRANSLATE * 0.75;

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const translateX = useRef(new Animated.Value(0)).current;
  const isNavigating = useRef(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderMove: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState
        ) => {
          if (isNavigating.current) return;

          const dx = Math.max(0, Math.min(gesture.dx, MAX_TRANSLATE));
          translateX.setValue(dx);
        },

        onPanResponderRelease: (
          _: GestureResponderEvent,
          gesture: PanResponderGestureState
        ) => {
          if (isNavigating.current) return;

          const dx = Math.max(0, Math.min(gesture.dx, MAX_TRANSLATE));
          const shouldNavigate = dx >= TRIGGER_AT;

          if (shouldNavigate) {
            isNavigating.current = true;

            Animated.timing(translateX, {
              toValue: MAX_TRANSLATE,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              try {
                // IMPORTANT: Make sure "Home" matches your navigator screen name exactly.
                router.replace('/Loginscreen');
              } catch (e) {
                // if navigation fails, allow retry and reset
                isNavigating.current = false;         
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              }
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
              tension: 90,
            }).start();
          }
        },
      }),
    [navigation, translateX]
  );

 return (
  <ImageBackground source={bgimage} className="flex-1" resizeMode="cover">
    <LinearGradient
      colors={[
        'rgba(60, 149, 204, 0.75)',
        'rgba(27,79,156,0.75)',
      ]}
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
        <View
          className="items-center"
          style={{ marginTop: isSmallDevice ? 10 : 1 }}
        >
          <Image
            source={medha}
            style={{
              width: isSmallDevice ? 290 : 200,
              height: isSmallDevice ? 140 : 122,
            }}
            resizeMode="contain"
          />
        </View>

        {/* CENTER IMAGE */}
        <View className="items-center">
          <View
            className="items-center justify-center"
            style={{
              width: width * 0.65,
              height: width * 0.65,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <View
              className="items-center justify-center"
              style={{
                width: width * 0.52,
                height: width * 0.52,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.28)',
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
          <Text className="text-[#EAF2FF] text-[15px] text-center">
            Your Family's Health, Our Priority
          </Text>
        </View>

        {/* SWIPE TRACK */}
        <View
          className="bg-[rgba(255,255,255,0.18)] px-2 justify-center overflow-hidden mb-5"
          style={{
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT,
            borderRadius: BUTTON_HEIGHT / 2,
          }}
        >
          <Text className="absolute self-center text-white text-[16px] font-medium opacity-95">
            Swipe to Start
          </Text>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              {
                width: KNOB_SIZE,
                height: KNOB_SIZE,
                borderRadius: KNOB_SIZE / 2,
                backgroundColor: '#0B3C78',
                alignItems: 'center',
                justifyContent: 'center',
              },
              { transform: [{ translateX }] },
            ]}
          >
            <Text className="text-white text-[26px] font-bold">{'>'}</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  </ImageBackground>
);

}
