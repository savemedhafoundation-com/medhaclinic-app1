import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import SvgSpeedometer from '../../components/Svgspeedometer';
import SvgHeader from '../../components/Clipperbg';

/* ================= ASSETS ================= */
const emojiLow = require('../../assets/images/low.png');
const emojiNormal = require('../../assets/images/normal.png');
const emojiHigh = require('../../assets/images/high.png');
const logo = require('../../assets/images/medha_logo.png');

/* ================= QUESTIONS ================= */
const QUESTIONS = [
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

/* ================= HEALTH SCORING ================= */
function getScore(
  type: 'HIGH_GOOD' | 'LOW_GOOD' | 'BALANCE',
  level: 'LOW' | 'NORMAL' | 'HIGH'
) {
  if (type === 'HIGH_GOOD') {
    return level === 'LOW' ? 1 : level === 'NORMAL' ? 2 : 3;
  }

  if (type === 'LOW_GOOD') {
    return level === 'LOW' ? 3 : level === 'NORMAL' ? 2 : 1;
  }

  if (type === 'BALANCE') {
    return level === 'NORMAL' ? 3 : 2;
  }

  return 0;
}

/* ================= MAIN COMPONENT ================= */
export default function TodayImmunityCheck() {
  /**
   * answers:
   * key → question index
   * value → 'LOW' | 'NORMAL' | 'HIGH'
   */
  const [answers, setAnswers] = useState<
    Record<number, 'LOW' | 'NORMAL' | 'HIGH'>
  >({});

  /* ================= CALCULATIONS ================= */
  const scores = Object.entries(answers).map(([index, level]) =>
    getScore(QUESTIONS[Number(index)].type, level)
  );

  const answeredCount = scores.length;

  const average =
    answeredCount === 0
      ? 0
      : scores.reduce((sum, v) => sum + v, 0) / answeredCount;

  // Map avg (1–3) → speedometer (0–10)
  const speedometerValue =
    answeredCount === 0
      ? 0
      : Math.round(2 + ((average - 1) / 2) * 8);

  const immunityLabel =
    average === 0
      ? ''
      : average < 1.8
      ? 'Low immunity'
      : average < 2.5
      ? 'Medium immunity, keep it up!'
      : 'High immunity';

  return (
    <View className="flex-1 bg-[#f5f6f8]">
      {/* ================= HEADER ================= */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="menu" size={26} color="#fff" />
            </View>

            <View className="items-center">
              <Image
                source={logo}
                className="w-[150px] h-[100px]"
                resizeMode="contain"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 250,
          paddingBottom: 140,
        }}
        className="px-4"
      >
        <Text className="text-[#0b4ea2] text-[24px] font-bold mb-1">
          Today’s Immunity Check
        </Text>
        <Text className="text-[#1fa2ff] mb-4">
          Select what feels true for you:
        </Text>

        {QUESTIONS.map((q, i) => (
          <View
            key={i}
            className="bg-white border border-[#bfe2ff] rounded-[18px] px-4 py-3 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#1fa2ff"
              />
              <Text className="ml-2 text-[15px] font-semibold text-[#0b4ea2]">
                {q.label}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Emoji
                img={emojiLow}
                label="Low"
                active={answers[i] === 'LOW'}
                onPress={() =>
                  setAnswers(prev => ({ ...prev, [i]: 'LOW' }))
                }
              />
              <Emoji
                img={emojiNormal}
                label="Normal"
                active={answers[i] === 'NORMAL'}
                onPress={() =>
                  setAnswers(prev => ({ ...prev, [i]: 'NORMAL' }))
                }
              />
              <Emoji
                img={emojiHigh}
                label="High"
                active={answers[i] === 'HIGH'}
                onPress={() =>
                  setAnswers(prev => ({ ...prev, [i]: 'HIGH' }))
                }
              />
            </View>
          </View>
        ))}

        {/* ================= SPEEDOMETER ================= */}
        <Text className="text-center text-[#1fa2ff] font-semibold mb-1">
          Your Score
        </Text>

        <SvgSpeedometer score={speedometerValue} />

        {immunityLabel !== '' && (
          <Text className="text-center mt-2 text-[#0b4ea2] font-semibold">
            {immunityLabel}
          </Text>
        )}

        <TouchableOpacity
  onPress={() => router.push("immunity/Immunity _results")}
  className="mt-6 bg-[#1fa2ff] py-4 rounded-full items-center"
  activeOpacity={0.85}
>
  <Text className="text-white text-[18px] font-semibold">
    Get My Result
  </Text>
</TouchableOpacity>

        <Text className="text-center text-[12px] text-[#1f3c66] mt-3">
          Lifestyle, digestion, sleep and mental balance together reflect your immunity level.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ================= EMOJI ================= */
function Emoji({ img, label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center w-[90px]"
      activeOpacity={0.85}
    >
      <Image source={img} className="w-10 h-10 mb-1" resizeMode="contain" />

      <View
        className={`px-4 py-[4px] rounded-full ${
          active ? 'bg-[#1fa2ff]' : 'bg-transparent'
        }`}
      >
        <Text
          className={`text-[12px] ${
            active ? 'text-white' : 'text-[#0b4ea2]'
          }`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
