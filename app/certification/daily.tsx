import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { fetchImmunityResult } from "../../services/openai";
import { QUESTIONS } from "../immunity/dailyimmunity";
import SvgHeader from '../../components/Clipperbg';

export default function DailyImmunityReport() {
  const { data } = useLocalSearchParams();
  const parsed = data ? JSON.parse(data as string) : null;

  const immunityScore = parsed?.speedometerValue ?? 0;
  const immunityLabel = parsed?.immunityLabel ?? '';
  const answers = parsed?.answers ?? {};

  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  async function generateReport() {
    const formattedAnswers = Object.entries(answers)
      .map(([index, value]) => {
        return `${QUESTIONS[Number(index)].label}: ${value}`;
      })
      .join("\n");

    const prompt = `
${formattedAnswers}

Overall Immunity Score: ${immunityScore}/10
Immunity Category: ${immunityLabel}

Provide ONLY 3 short paragraphs summarizing immunity status in a positive, medical-report tone.
`;

    try {
      const aiText = await fetchImmunityResult(prompt);
      const cleaned = aiText
        .split("\n")
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, 3);
      setParagraphs(cleaned);
    } catch {
      setParagraphs([
        "Your immunity indicators reflect a stable and balanced internal health state.",
        "Daily physiological functions are operating within healthy ranges.",
        "Overall immunity strength suggests strong resilience and wellness.",
      ]);
    } finally {
      setLoading(false);
    }
  }

 return (
  <SafeAreaView className="flex-1 bg-[#f7fff6]">
    <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 mt-4 justify-center">
            <View className="absolute left-4 right-4 flex-row justify-between">
              <Ionicons name="chevron-back" size={26} color="#fff" />
              <Ionicons name="menu" size={26} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </View>
    <ScrollView 
     contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}

    >

      {/* ===== HEADER ===== */}
      {/* <View className="bg-[#1aa10f] pt-6 pb-14 rounded-b-[40px]">
        <View className="items-center">
          <Text className="text-white text-[20px] font-bold">
            MEDHA CLINIC
          </Text>
          <Text className="text-[#e9ffe8] text-[13px] mt-1">
            Restoring Life Naturally
          </Text>
        </View>
      </View> */}

      {/* ===== TITLE ===== */}
      <View className="px-5 mt-8">
        <Text className="text-[#166534] text-[30px] font-bold leading-[38px]">
          Daily Immunity Status
        </Text>
        <Text className="text-[#166534] text-[30px] font-bold">
          Report
        </Text>
      </View>

      {/* ===== PATIENT CARD ===== */}
      <View className="mx-5 mt-6 bg-[#147a0a] rounded-[24px] p-5 flex-row items-center">
        <View className="flex-1">
          <Text className="text-[#dcfce7] text-[14px]">
            Patient Name
          </Text>

          <Text className="text-white text-[22px] font-bold mt-1">
            Sachin Biswas
          </Text>

          <View className="bg-white mt-3 px-4 py-1.5 rounded-full self-start">
            <Text className="text-[#166534] text-[14px] font-semibold">
              Immunity Score – {immunityScore} / 10
            </Text>
          </View>
        </View>

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          className="w-[72px] h-[72px] rounded-full"
        />
      </View>

      {/* ===== CONGRATS BADGE ===== */}
      <View className="mx-5 mt-6">
        <View className="bg-[#22c55e] px-8 py-3 rounded-full self-start">
          <Text className="text-white text-[16px] font-bold">
            Congratulations
          </Text>
        </View>
      </View>

      {/* ===== DESCRIPTION ===== */}
      <View className="mx-5 mt-5">
        <Text className="text-[#1f2937] text-[16px] leading-[26px]">
          The Health Immunity Checkup Clearance Certificate is a wellness-based
          digital assessment summary designed to reflect your current immunity
          and overall health balance based on daily physiological indicators.
        </Text>
      </View>

      {/* ===== STATUS BOX (CHATGPT RESULT) ===== */}
      <View className="mx-5 mt-6 bg-[#dcfce7] rounded-[24px] p-5">
        {loading ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-[#166534] mt-3">
              Generating immunity insights…
            </Text>
          </View>
        ) : (
          paragraphs.map((para, index) => (
            <View key={index} className="flex-row mb-4">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#16a34a"
                style={{ marginTop: 2 }}
              />
              <Text className="text-[#14532d] text-[16px] ml-3 flex-1 leading-[24px]">
                {para}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* ===== CERTIFIED ===== */}
      <View className="items-center mt-10">
        <View className="bg-[#16a34a] w-[56px] h-[56px] rounded-full items-center justify-center">
          <Ionicons name="checkmark" size={32} color="#fff" />
        </View>

        <Text className="text-[#166534] text-[16px] mt-4 text-center px-10">
          Certified healthy and fit for all normal activities and travel.
        </Text>
      </View>

      <View className="h-28" />
    </ScrollView>
  </SafeAreaView>
);

}
