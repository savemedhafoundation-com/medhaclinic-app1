import React, { useEffect, useMemo, useReducer } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import SvgHeader from '../../components/Clipperbg';
import { usePatientProfile } from '../../hooks/use-patient-profile';
import { fetchImmunityResult } from '../../services/openai';

type State = {
  paragraphs: string[];
  loading: boolean;
  error: boolean;
};

type Action =
  | { type: 'SET_RESULT'; paragraphs: string[] }
  | { type: 'SET_ERROR' };

const initialState: State = {
  paragraphs: [],
  loading: true,
  error: false,
};

const defaultProfileImage = require('../../assets/images/profile.png');

function reportReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_RESULT':
      return { paragraphs: action.paragraphs, loading: false, error: false };
    case 'SET_ERROR':
      return {
        loading: false,
        error: true,
        paragraphs: [
          'Your immunity indicators reflect a stable and balanced internal health state.',
          'Daily physiological functions are operating within healthy ranges.',
          'Overall immunity strength suggests strong resilience and wellness.',
        ],
      };
    default:
      return state;
  }
}

export default function DailyImmunityReport() {
  const { data, summary, speedometer } = useLocalSearchParams();
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const { patientName, patientPhoto, patientAge, patientGender } =
    usePatientProfile();

  const payload = useMemo(() => {
    try {
      return JSON.parse(data as string);
    } catch {
      return [];
    }
  }, [data]);

  const summaryData = useMemo(() => {
    try {
      return JSON.parse(summary as string);
    } catch {
      return {};
    }
  }, [summary]);

  const speedometerData = useMemo(() => {
    try {
      return JSON.parse(speedometer as string);
    } catch {
      return {};
    }
  }, [speedometer]);

  const immunityScore = useMemo(
    () => speedometerData?.score ?? 0,
    [speedometerData]
  );
  const immunityLabel = useMemo(
    () => speedometerData?.label ?? '',
    [speedometerData]
  );
  const completionPercent = useMemo(
    () => summaryData?.completionPercent ?? 0,
    [summaryData]
  );

  const prompt = useMemo(() => {
    if (!payload?.length) {
      return '';
    }

    const formattedAnswers = payload
      .filter((question: any) => question.answered)
      .map(
        (question: any) =>
          `${question.title}: ${question.selectedLabel} (Score: ${question.score})`
      )
      .join('\n');

    return `
Patient answered ${summaryData.totalAnswered} of ${summaryData.totalQuestions} questions.
Completion: ${completionPercent}%

Answers:
${formattedAnswers}

Speedometer Score: ${immunityScore}/10
Immunity Level: ${immunityLabel}
Summary: ${JSON.stringify(summaryData)}

Provide ONLY 3 short paragraphs summarizing immunity status in a positive, medical-report tone.
    `.trim();
  }, [payload, summaryData, completionPercent, immunityScore, immunityLabel]);

  useEffect(() => {
    if (!prompt) {
      return;
    }

    async function generateReport() {
      try {
        const aiText = await fetchImmunityResult(prompt);
        const cleaned = aiText
          .split('\n')
          .map((paragraph: string) => paragraph.trim())
          .filter((paragraph: string) => paragraph.length > 0)
          .slice(0, 3);

        dispatch({ type: 'SET_RESULT', paragraphs: cleaned });
      } catch {
        dispatch({ type: 'SET_ERROR' });
      }
    }

    void generateReport();
  }, [prompt]);

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
          paddingTop: 220,
        }}
      >
        <View className="px-5 mt-8">
          <Text className="text-[#166534] text-[30px] font-bold leading-[38px]">
            Daily Immunity Status
          </Text>
          <Text className="text-[#166534] text-[30px] font-bold">Report</Text>
        </View>

        <View className="mx-5 mt-6 bg-[#147a0a] rounded-[24px] p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[#dcfce7] text-[14px]">Patient Name</Text>
              <Text className="text-white text-[22px] font-bold mt-1">
                {patientName}
              </Text>

              <View className="flex-row mt-2 gap-3">
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="#bbf7d0"
                  />
                  <Text className="text-[#bbf7d0] text-[13px] ml-1">
                    Age: {patientAge ?? '--'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color="#bbf7d0"
                  />
                  <Text className="text-[#bbf7d0] text-[13px] ml-1">
                    {patientGender}
                  </Text>
                </View>
              </View>

              <View className="bg-white mt-3 px-4 py-1.5 rounded-full self-start">
                <Text className="text-[#166534] text-[14px] font-semibold">
                  Immunity Score - {immunityScore} / 10
                </Text>
              </View>
            </View>

            <Image
              source={patientPhoto ? { uri: patientPhoto } : defaultProfileImage}
              className="w-[72px] h-[72px] rounded-full ml-4"
            />
          </View>
        </View>

        <View className="mx-5 mt-6">
          <View className="bg-[#22c55e] px-8 py-3 rounded-full self-start">
            <Text className="text-white text-[16px] font-bold">
              {immunityLabel || 'Congratulations'}
            </Text>
          </View>
        </View>

        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-[#166534] text-[22px] font-extrabold">
              {immunityScore}
              <Text className="text-gray-400 text-sm"> / 10</Text>
            </Text>
            <Text className="text-gray-500 text-xs mt-1">Avg Score</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-[#166534] text-[22px] font-extrabold">
              {summaryData.totalAnswered}
              <Text className="text-gray-400 text-sm">
                {' '}
                / {summaryData.totalQuestions}
              </Text>
            </Text>
            <Text className="text-gray-500 text-xs mt-1">Answered</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
            <Text className="text-[#166534] text-[22px] font-extrabold">
              {completionPercent}
              <Text className="text-gray-400 text-sm">%</Text>
            </Text>
            <Text className="text-gray-500 text-xs mt-1">Complete</Text>
          </View>
        </View>

        <View className="mx-5 mt-5">
          <Text className="text-[#1f2937] text-[16px] leading-[26px]">
            The Health Immunity Checkup Clearance Certificate is a wellness-based
            digital assessment summary designed to reflect your current immunity
            and overall health balance based on daily physiological indicators.
          </Text>
        </View>

        <View className="mx-5 mt-6 bg-[#dcfce7] rounded-[24px] p-5">
          {state.loading ? (
            <View className="items-center py-6">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="text-[#166534] mt-3">
                Generating immunity insights...
              </Text>
            </View>
          ) : (
            state.paragraphs.map((paragraph, index) => (
              <View key={index} className="flex-row mb-4">
                <Ionicons
                  name={state.error ? 'alert-circle' : 'checkmark-circle'}
                  size={22}
                  color="#16a34a"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-[#14532d] text-[16px] ml-3 flex-1 leading-[24px]">
                  {paragraph}
                </Text>
              </View>
            ))
          )}
        </View>

        <View className="items-center mt-10">
          <View className="bg-[#16a34a] w-[56px] h-[56px] rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
          <Text className="text-[#166534] text-[16px] mt-4 text-center px-10">
            Certified healthy and fit for all normal activities and travel.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="mx-5 mt-8 bg-[#16a34a] py-4 rounded-full items-center shadow-lg shadow-green-900/30"
          onPress={() => router.push('/advice')}
        >
          <Text className="text-white text-[18px] font-bold">Get Advice</Text>
        </TouchableOpacity>

        <View className="h-28" />
      </ScrollView>
    </SafeAreaView>
  );
}
