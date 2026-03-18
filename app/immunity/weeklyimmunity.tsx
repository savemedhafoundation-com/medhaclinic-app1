import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import SvgHeader from '../../components/Clipperbg';

/* ================= ASSETS ================= */
const emojiLow = require('../../assets/images/low.png');
const emojiNormal = require('../../assets/images/normal.png');
const emojiHigh = require('../../assets/images/high.png');

/* ================= QUESTIONS ================= */
const QUESTIONS = [
  'Regular Bowel Movement',
  'Breathing Issues',
  'Body Weight',
  'Skin Problem',
  'Fatigue',
  'Appetite',
  'Refreshing Sleep',
  'Calm, Positive Mind',
];

/* ================= EMOJI MAP ================= */
const EMOJI_MAP = {
  LOW: { img: emojiLow, label: 'Low', color: '#8BC34A' },
  NORMAL: { img: emojiNormal, label: 'Normal', color: '#2E7D32' },
  HIGH: { img: emojiHigh, label: 'High', color: '#FB8C00' },
};

type Level = 'LOW' | 'NORMAL' | 'HIGH';

export default function WeeklyImmunityCheck() {
  const [answers, setAnswers] = useState<Record<number, Level>>({});

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
              {/* <Image
                source={logo}
                className="w-[150px] h-[100px]"
                resizeMode="contain"
              /> */}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 240,
          paddingBottom: 140,
        }}
        className="px-4"
      >
        {/* ===== HEADING (MATCHES IMAGE) ===== */}
        <Text className="text-[#0b4ea2] text-[26px] font-bold mb-2">
          Weekly Immunity check
        </Text>

        <Text className="text-[#1fa2ff] text-[15px] mb-6 leading-6">
          Please assess the status of these points for the past week for a clear
          immunity report.
        </Text>

        {/* ===== QUESTIONS ===== */}
        {QUESTIONS.map((q, i) => {
          const selected = answers[i];

          return (
            <View
              key={i}
              className="bg-white border border-[#bfe2ff] rounded-[16px] p-4 mb-4"
            >
              {/* TITLE + SELECTED EMOJI */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[15px] font-semibold text-[#0b4ea2]">
                  {q}
                </Text>

                {selected && (
                  <View className="flex-row items-center">
                    <Image
                      source={EMOJI_MAP[selected].img}
                      className="w-6 h-6 mr-1"
                      resizeMode="contain"
                    />
                    <Text
                      style={{ color: EMOJI_MAP[selected].color }}
                      className="text-[13px] font-semibold"
                    >
                      {EMOJI_MAP[selected].label}
                    </Text>
                  </View>
                )}
              </View>

              {/* BUTTONS */}
              <View className="flex-row justify-between">
                {(['LOW', 'NORMAL', 'HIGH'] as Level[]).map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() =>
                      setAnswers(prev => ({ ...prev, [i]: level }))
                    }
                    activeOpacity={0.85}
                    className={`px-6 py-2 rounded-lg ${
                      selected === level
                        ? 'bg-[#1fa2ff]'
                        : 'bg-[#e6eef8]'
                    }`}
                  >
                    <Text
                      className={`${
                        selected === level
                          ? 'text-white'
                          : 'text-[#0b4ea2]'
                      } font-medium`}
                    >
                      {EMOJI_MAP[level].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* ACTION BUTTON */}
        <TouchableOpacity
          className="mt-6 bg-[#1fa2ff] py-4 rounded-full items-center"
          onPress={() => router.push('/certification/weekly')}
        >
          <Text className="text-white text-[18px] font-semibold">
            Prepare Status Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
