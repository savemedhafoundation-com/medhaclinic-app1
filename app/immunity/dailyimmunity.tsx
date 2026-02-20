// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import SvgHeader from "../../components/Clipperbg";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function DailyImmunityFirstThree() {
//   const [answers, setAnswers] = useState({});

//   const handleSelect = (question, value) => {
//     setAnswers({ ...answers, [question]: value });
//   };

//   const OptionCard = ({ image, label, value, question }) => {
//     const selected = answers[question] === value;

//     return (
//       <TouchableOpacity
//         onPress={() => handleSelect(question, value)}
//         className="items-center flex-1 px-2"
//         activeOpacity={0.8}
//       >
//         {/* MUCH Larger Image */}
//         <Image
//           source={image}
//           className="w-36 h-36"
//           resizeMode="contain"
//         />

//         {/* Label */}
//         <Text
//           className={`text-base font-semibold mt-3 text-center ${
//             selected ? "text-green-600" : "text-gray-700"
//           }`}
//         >
//           {label}
//         </Text>

//         {/* Tick */}
//         {selected && (
//           <Ionicons
//             name="checkmark-circle"
//             size={28}
//             color="#16a34a"
//             style={{ marginTop: 8 }}
//           />
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100">
      
//       {/* Header */}
//       <View className="relative">
//         <SvgHeader />
//         <View className="absolute top-10 left-0 right-0 items-center">
//           <Text className="text-white text-xl font-bold">
//             Daily Immunity Checkup
//           </Text>
//         </View>
//       </View>

//       <ScrollView
//         className="flex-1 px-4 mt-8"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* 1 */}
//         <Text className="text-lg font-bold text-green-700 mb-6">
//           1. Physical Energy
//         </Text>

//         <View className="flex-row justify-between mb-14">
//           <OptionCard
//             question="energy"
//             value="good"
//             label="Good Energy"
//             image={require("../../assets/images/immunity/physical1.png")}
//           />
//           <OptionCard
//             question="energy"
//             value="poor"
//             label="Poor Energy"
//             image={require("../../assets/images/immunity/physical2.png")}
//           />
//           <OptionCard
//             question="energy"
//             value="verypoor"
//             label="Very Poor Energy"
//             image={require("../../assets/images/immunity/physical3.png")}
//           />
//         </View>

//         {/* 2 */}
//         <Text className="text-lg font-bold text-green-700 mb-6">
//           2. Appetite
//         </Text>

//         <View className="flex-row justify-between mb-14">
//           <OptionCard
//             question="appetite"
//             value="good"
//             label="Good Appetite"
//             image={require("../../assets/images/immunity/appetite1.png")}
//           />
//           <OptionCard
//             question="appetite"
//             value="poor"
//             label="Poor Appetite"
//             image={require("../../assets/images/immunity/appetite2.png")}
//           />
//           <OptionCard
//             question="appetite"
//             value="verypoor"
//             label="Very Poor Appetite"
//             image={require("../../assets/images/immunity/appetite3.png")}
//           />
//         </View>

//         {/* 3 */}
//         <Text className="text-lg font-bold text-green-700 mb-6">
//           3. Digestion Comfort
//         </Text>

//         <View className="flex-row justify-between mb-14">
//           <OptionCard
//             question="digestion"
//             value="good"
//             label="Good Digestion"
//             image={require("../../assets/images/immunity/digestion1.png")}
//           />
//           <OptionCard
//             question="digestion"
//             value="poor"
//             label="Poor Digestion"
//             image={require("../../assets/images/immunity/digestion2.png")}
//           />
//           <OptionCard
//             question="digestion"
//             value="verypoor"
//             label="Very Poor Digestion"
//             image={require("../../assets/images/immunity/digestion4.png")}
//           />
//         </View>

//         {/* 4 */}
//         <Text className="text-lg font-bold text-green-700 mb-6">
//           4. Burning / Pain
//         </Text>

//         <View className="flex-row justify-between mb-24">
//           <OptionCard
//             question="burning"
//             value="none"
//             label="No Burning"
//             image={require("../../assets/images/immunity/burning1.png")}
//           />
//           <OptionCard
//             question="burning"
//             value="mild"
//             label="Mild Burning"
//             image={require("../../assets/images/immunity/burning2.png")}
//           />
//           <OptionCard
//             question="burning"
//             value="severe"
//             label="Severe Burning"
//             image={require("../../assets/images/immunity/burning3.png")}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
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
  if (level === 'NORMAL') return 10;
  if (level === 'LOW') return 6;
  if (level === 'HIGH') return 4;
  return 0;
}

/* ================= MAIN ================= */
export default function TodayImmunityCheck() {
  const [answers, setAnswers] = useState<
    Record<number, 'LOW' | 'NORMAL' | 'HIGH'>
  >({});

  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const scores = Object.entries(answers).map(([i, v]) =>
    getScore(QUESTIONS[Number(i)].type, v)
  );

  const avg =
    scores.length === 0
      ? 0
      : scores.reduce((a, b) => a + b, 0) / scores.length;

  const speedometerValue = Number(avg.toFixed(2));

  const immunityLabel =
    avg === 0
      ? ''
      : avg < 6
      ? 'Low Immunity'
      : avg < 8
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
              {(['NORMAL', 'LOW', 'HIGH'] as const).map(level => (
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

        {/* SPEEDOMETER */}
        <SvgSpeedometer score={speedometerValue} />

        {immunityLabel !== '' && (
          <Text className="text-center mt-5 text-[#0b4ea2] font-semibold text-[16px]">
            {immunityLabel}
          </Text>
        )}

        {/* CTA */}
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
          <Text
            className={`text-[18px] font-semibold ${
              allAnswered ? 'text-white' : 'text-[#166534]'
            }`}
          >
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
function Emoji({
  img,
  label,
  active,
  onPress,
}: {
  img: any;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
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
