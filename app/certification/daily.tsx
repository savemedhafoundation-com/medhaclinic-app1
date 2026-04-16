import React, {
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';
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

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { usePatientProfile } from '../../hooks/use-patient-profile';
import { useAuth } from '../../providers/AuthProvider';
import { goBackOrReplace } from '../../services/navigation';
import { fetchImmunityResult } from '../../services/openai';

type State = {
  paragraphs: string[];
  loading: boolean;
  error: boolean;
  source: 'ai' | 'fallback' | null;
  errorMessage: string | null;
};

type AssessmentAnswer = {
  answered?: boolean;
  title?: string;
  selectedLabel?: string;
  score?: number;
};

type SummaryData = {
  totalAnswered?: number;
  totalQuestions?: number;
  completionPercent?: number;
};

type SpeedometerData = {
  score?: number;
  label?: string;
};

type Action =
  | { type: 'SET_RESULT'; paragraphs: string[] }
  | { type: 'SET_ERROR'; message: string; paragraphs: string[] };

const initialState: State = {
  paragraphs: [],
  loading: true,
  error: false,
  source: null,
  errorMessage: null,
};

function getScoreTone(score: number) {
  if (score >= 8) {
    return {
      summary: 'strong daily immune resilience and a well-balanced wellness pattern',
      guidance:
        'Maintain the same routine with good hydration, steady meals, regular sleep, and light movement to preserve this momentum.',
    };
  }

  if (score >= 6) {
    return {
      summary: 'generally stable immunity with a few areas that can still be strengthened',
      guidance:
        'A little more consistency in sleep, hydration, nutrition, and symptom tracking can help push this result higher over the next few days.',
    };
  }

  if (score >= 4) {
    return {
      summary: 'mixed daily immunity signals that would benefit from closer self-care today',
      guidance:
        'Prioritize rest, hydration, balanced meals, and a calmer routine today, then repeat the check tomorrow to watch for improvement.',
    };
  }

  return {
    summary: 'lower-than-usual daily resilience signals based on the available check-in data',
    guidance:
      'Use today as a recovery day with extra rest, fluids, gentle nutrition, and closer symptom observation, and seek medical guidance if concerns are increasing.',
  };
}

function buildFallbackParagraphs({
  answers,
  completionPercent,
  immunityLabel,
  immunityScore,
  summaryData,
}: {
  answers: AssessmentAnswer[];
  completionPercent: number;
  immunityLabel: string;
  immunityScore: number;
  summaryData: SummaryData;
}) {
  const answeredCount = summaryData.totalAnswered ?? answers.filter(item => item.answered).length;
  const totalQuestions = summaryData.totalQuestions ?? answers.length;
  const roundedCompletion = Number.isFinite(completionPercent)
    ? Math.round(completionPercent)
    : 0;
  const tone = getScoreTone(immunityScore);
  const label = immunityLabel.trim() || 'Current';
  const focusAreas = answers
    .filter(
      item =>
        item.answered &&
        typeof item.title === 'string' &&
        typeof item.score === 'number' &&
        item.score <= 1
    )
    .map(item => item.title?.trim())
    .filter((item): item is string => Boolean(item))
    .slice(0, 2);

  const focusSentence = focusAreas.length
    ? `The main areas to watch in the next check-in are ${focusAreas.join(' and ')}.`
    : 'No single response stands out as an urgent concern from the available assessment answers.';

  return [
    `Today's assessment suggests ${tone.summary}, with an immunity score of ${immunityScore}/10 and a ${label} status.`,
    `This report is based on ${answeredCount} of ${totalQuestions} answered questions with ${roundedCompletion}% completion, so it reflects the information available from today's check-in.`,
    `${focusSentence} ${tone.guidance}`,
  ];
}

const defaultProfileImage = require('../../assets/images/profile.png');

function reportReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_RESULT':
      return {
        paragraphs: action.paragraphs,
        loading: false,
        error: false,
        source: 'ai',
        errorMessage: null,
      };
    case 'SET_ERROR':
      return {
        loading: false,
        error: true,
        source: 'fallback',
        errorMessage: action.message,
        paragraphs: action.paragraphs,
      };
    default:
      return state;
  }
}

export default function DailyImmunityReport() {
  const { data, summary, speedometer } = useLocalSearchParams();
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const { user } = useAuth();
  const { patientName, patientPhoto, patientAge, patientGender } =
    usePatientProfile();

  const payload = useMemo<AssessmentAnswer[]>(() => {
    try {
      const parsed = JSON.parse(data as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [data]);

  const summaryData = useMemo<SummaryData>(() => {
    try {
      const parsed = JSON.parse(summary as string);
      return parsed && typeof parsed === 'object' ? (parsed as SummaryData) : {};
    } catch {
      return {};
    }
  }, [summary]);

  const speedometerData = useMemo<SpeedometerData>(() => {
    try {
      const parsed = JSON.parse(speedometer as string);
      return parsed && typeof parsed === 'object'
        ? (parsed as SpeedometerData)
        : {};
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

  const fallbackParagraphs = useMemo(
    () =>
      buildFallbackParagraphs({
        answers: payload,
        completionPercent,
        immunityLabel,
        immunityScore,
        summaryData,
      }),
    [payload, completionPercent, immunityLabel, immunityScore, summaryData]
  );

  useEffect(() => {
    if (!prompt) {
      dispatch({
        type: 'SET_ERROR',
        message: 'Assessment answers are unavailable for AI summary.',
        paragraphs: fallbackParagraphs,
      });
      return;
    }

    async function generateReport() {
      try {
        const aiText = await fetchImmunityResult(prompt, user);
        const cleaned = aiText
          .split('\n')
          .map((paragraph: string) => paragraph.trim())
          .filter((paragraph: string) => paragraph.length > 0)
          .slice(0, 3);

        dispatch({ type: 'SET_RESULT', paragraphs: cleaned });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unknown AI summary error.';

        console.log('[DailyReport] AI summary error:', message);
        dispatch({ type: 'SET_ERROR', message, paragraphs: fallbackParagraphs });
      }
    }

    void generateReport();
  }, [fallbackParagraphs, prompt, user]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f7fff6]"
      edges={['left', 'right', 'bottom']}
    >
      <ScreenNav onBackPress={() => goBackOrReplace('/immunity/dailyimmunity')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
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
            <>
              <View
                className={`mb-4 self-start rounded-full px-3 py-1 ${
                  state.source === 'ai' ? 'bg-[#bbf7d0]' : 'bg-[#fef3c7]'
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    state.source === 'ai' ? 'text-[#166534]' : 'text-[#92400e]'
                  }`}
                >
                  {state.source === 'ai'
                    ? 'Source: AI-generated summary'
                    : 'Source: Template fallback summary'}
                </Text>
              </View>

              {state.errorMessage ? (
                <Text className="mb-4 text-[12px] leading-[18px] text-[#92400e]">
                  AI request failed: {state.errorMessage}
                </Text>
              ) : null}

              {state.paragraphs.map((paragraph, index) => (
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
              ))}
            </>
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
