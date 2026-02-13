import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import SvgSpeedometer from '../../components/Svgspeedometer';
import SvgHeader from '../../components/Clipperbg';

/* ================= ASSETS ================= */
const emojiLow = require('../../assets/images/low.png');
const emojiNormal = require('../../assets/images/normal.png');
const emojiHigh = require('../../assets/images/high.png');

/* ================= QUESTIONS ================= */
export const QUESTIONS = [
  { label: 'Regular Bowel Movement', type: 'HIGH_GOOD' },
  { label: 'Breathing Issues', type: 'LOW_GOOD' },
  { label: 'Body Weight', type: 'BALANCE' },
  { label: 'Digestion Problem', type: 'LOW_GOOD' },
  { label: 'Fatigue', type: 'LOW_GOOD' },
  { label: 'Appetite', type: 'HIGH_GOOD' },
  { label: 'Refreshing Sleep', type: 'HIGH_GOOD' },
  { label: 'Pain', type: 'LOW_GOOD' },
  { label: 'Calm, Positive Mind', type: 'HIGH_GOOD' },
];

/* ================= SCORING ================= */
function getScore(
  type: 'HIGH_GOOD' | 'LOW_GOOD' | 'BALANCE',
  level: 'LOW' | 'NORMAL' | 'HIGH'
) {
  // LOW = 4, HIGH = 4, NORMAL = 10
  return level === 'NORMAL' ? 10 : 4;
}

/* ================= MAIN ================= */
export default function TodayImmunityCheck() {
  const [answers, setAnswers] = useState<Record<number, 'LOW' | 'NORMAL' | 'HIGH'>>(
    {}
  );

  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const scores = Object.entries(answers).map(([i, v]) =>
    getScore(QUESTIONS[Number(i)].type, v)
  );

  // Average range: 4 (worst) to 10 (best)
  const avg =
    scores.length === 0 ? 0 : scores.reduce((a, b) => a + b, 0) / scores.length;

  // Speedometer shows the exact average value (updates in real-time)
  const speedometerValue = Number(avg.toFixed(2));

  // Updated immunity thresholds for new 4-10 range
  const immunityLabel =
    avg === 0
      ? ''
      : avg < 6
      ? 'Low Immunity'
      : avg < 8.5
      ? 'Medium Immunity'
      : 'High Immunity';

  const payload = {
    answers,
    avg,
    speedometerValue,
    immunityLabel,
  };

  return (
    <View className="flex-1 bg-[#f5f6f8]">
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 mt-4 justify-center">
            <View className="absolute left-4 right-4 flex-row justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="menu" size={26} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* CONTENT */}
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingTop: 250, paddingBottom: 140 }}
      >
        <Text className="text-[#0b4ea2] text-[24px] font-bold mb-1">
          Today's Immunity Check
        </Text>
        <Text className="text-[#1fa2ff] mb-4">
          Select what feels true for you:
        </Text>

        {/* QUESTIONS */}
        {QUESTIONS.map((q, i) => (
          <View
            key={i}
            className="bg-white border border-[#bfe2ff] rounded-[18px] px-4 py-6 mb-6"
          >
            <Text className="text-[20px] font-semibold text-[#0b4ea2] mb-8">
              {q.label}
            </Text>

            <View className="flex-row justify-between">
              {(['LOW', 'NORMAL', 'HIGH'] as const).map(level => (
                <Emoji
                  key={level}
                  img={
                    level === 'LOW'
                      ? emojiLow
                      : level === 'NORMAL'
                      ? emojiNormal
                      : emojiHigh
                  }
                  label={level}
                  active={answers[i] === level}
                  onPress={() =>
                    setAnswers(prev => ({ ...prev, [i]: level }))
                  }
                />
              ))}
            </View>
          </View>
        ))}

        {/* SPEEDOMETER - Shows exact average value with 2 decimals, updates real-time */}
        <SvgSpeedometer score={speedometerValue} />

        {immunityLabel !== '' && (
          <Text className="text-center mt-5 text-[#0b4ea2] font-semibold text-[16px]">
            {immunityLabel}
          </Text>
        )}

        {/* CTA — ENABLED ONLY WHEN ALL ANSWERED */}
        <TouchableOpacity
          disabled={!allAnswered}
          onPress={() =>
            router.push({
              pathname: 'certification/daily',
              params: { data: JSON.stringify(payload) },
            })
          }
          className={`mt-6 py-4 rounded-full items-center ${
            allAnswered ? 'bg-[#16a34a]' : 'bg-[#bbf7d0]'
          }`}
        >
          <Text className={`text-[18px] font-semibold ${
            allAnswered ? 'text-white' : 'text-[#166534]'
          }`}>
            {allAnswered
              ? 'Get My Result'
              : `Get My Result (${answeredCount}/${totalQuestions})`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ================= EMOJI ================= */
function Emoji({ img, label, active, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.6,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} className="items-center w-[90px]">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={img} className="w-10 h-10 mb-1" resizeMode="contain" />
      </Animated.View>

      <View
        className={`px-4 py-1 rounded-full ${
          active ? 'bg-[#1fa2ff]' : ''
        }`}
      >
        <Text className={`${active ? 'text-white' : 'text-[#0b4ea2]'}`}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}