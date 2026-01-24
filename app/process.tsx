import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import tick from '../assets/images/doubletick.png';

/* ================= DATA ================= */

const QUESTIONS: string[] = [
  'Physical Energy',
  'Appetite',
  'Body Weight',
  'Digestive Problems',
  'Kidney Problems',
  'Burning or Pain',
  'Thyroid Disorder',
  'Diabetes Problem',
  'Blood Pressure',
  'Blood Health',
  'Fever',
  'Immunity',
  'Nerve Problem',
  'Breathing Problem',
  'Skin Health',
  'Hair Problem',
  'Eye Problem',
  'Mouth Issue',
  'Dental Issue',
  'Breast Health',
  'Menstruation',
  'Sexual Health',
  'Memory Health',
];

const OPTIONS: Array<{ emoji: string; label: string; score: number }> = [
  { emoji: '😁', label: 'Very Low', score: 10 },
  { emoji: '🙂', label: 'Low', score: 8 },
  { emoji: '😐', label: 'Normal', score: 6 },
  { emoji: '😟', label: 'High', score: 4 },
  { emoji: '😡', label: 'Very High', score: 2 },
];

type AnswerMap = Record<number, number>;

/* ================= COMPONENT ================= */

export default function ProcessPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});

  const selectOption = (questionIndex: number, score: number) => {
    setAnswers((prev) => {
      return {
        ...prev,
        [questionIndex]: score,
      };
    });
  };

  const submitAssessment = () => {
    const answeredCount = Object.keys(answers).length;

    if (answeredCount !== QUESTIONS.length) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    let total = 0;
    let i = 0;

    for (i = 0; i < QUESTIONS.length; i++) {
      total = total + (answers[i] !== undefined ? answers[i] : 6);
    }

    const healthScore = total / QUESTIONS.length;

    const immunityIndex = QUESTIONS.indexOf('Immunity');
    const immunityScore =
      answers[immunityIndex] !== undefined
        ? answers[immunityIndex]
        : 6;

    router.push(
      `/assessment/certificate?healthScore=${healthScore.toFixed(1)}&immunityScore=${immunityScore.toFixed(1)}`
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#F5FAFF] p-4">
      <Text className="text-[26px] font-bold text-[#0B4F8A]">Process</Text>
      <Text className="text-[#555] mb-[18px]">
        Answer the following questions
      </Text>

      {QUESTIONS.map((question, index) => {
        return (
          <View key={index} className="mb-[18px]">
            <Text className="font-semibold mb-2 text-[#333]">
              {index + 1}. {question}
            </Text>

            <View className="flex-row justify-between">
              {OPTIONS.map((option) => {
                const selected = answers[index] === option.score;

                return (
                  <TouchableOpacity
                    key={option.label}
                    className={`w-[18%] items-center py-[6px] rounded-[12px] relative ${
                      selected ? 'bg-[#CDE7FF]' : ''
                    }`}
                    onPress={() => {
                      selectOption(index, option.score);
                    }}
                  >
                    <Text className="text-[26px]">{option.emoji}</Text>

                    <Text className="text-[10px] text-center mt-[2px]">
                      {option.label}
                    </Text>

                    {/* 🔵 Blue Tick from Assets (BOTTOM) */}
                    {selected && (
                      <Image
                        source={tick}
                        className="w-[38px] h-[38px] mt-1"
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        className="bg-[#0B4F8A] py-[14px] rounded-[30px] my-[30px]"
        onPress={submitAssessment}
      >
        <Text className="text-white font-semibold text-center text-[16px]">
          Submit
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
