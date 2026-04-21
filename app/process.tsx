import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  ToastAndroid,
} from 'react-native';

/* =======================
   EMOJI ASSETS
======================= */
const EMOJI = {
  veryGood: require('../assets/images/process_emoji/normal.png'),
  good: require('../assets/images/process_emoji/normal.png'),
  moderate: require('../assets/images/process_emoji/normal.png'),
  bad: require('../assets/images/process_emoji/bad.png'),
  veryBad: require('../assets/images/process_emoji/verybad.png'),
};

/* =======================
   SCORE MAP
======================= */
const SCORE_MAP = [10, 8, 6, 4, 2];

type OptionType = {
  source: any;
  label: string;
};

type QuestionType = {
  title: string;
  options: OptionType[];
};

/* =======================
   ANIMATED EMOJI
======================= */
const AnimatedEmoji = ({
  source,
  scale,
  onPress,
}: {
  source: any;
  scale: Animated.Value;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} hitSlop={12}>
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={{
        width: 44,
        height: 44,
        transform: [{ scale }],
      }}
    />
  </Pressable>
);

/* =======================
   OPTION
======================= */
const Option = ({
  source,
  label,
  selected,
  scale,
  onPress,
}: {
  source: any;
  label: string;
  selected: boolean;
  scale: Animated.Value;
  onPress: () => void;
}) => (
  <View className="flex-1 items-center">
    <AnimatedEmoji source={source} scale={scale} onPress={onPress} />

    <Text className="text-sm text-gray-700 mt-2 text-center">
      {label}
    </Text>

    {selected && (
      <View className="mt-2 bg-green-600 w-5 h-5 rounded-full items-center justify-center">
        <View className="w-2.5 h-1.5 border-l-2 border-b-2 border-white rotate-[-45deg]" />
      </View>
    )}
  </View>
);

/* =======================
   QUESTION
======================= */
const Question = ({
  qIndex,
  title,
  options,
  value,
  onSelect,
  scaleMap,
  animateScale,
}: {
  qIndex: number;
  title: string;
  options: OptionType[];
  value: number;
  onSelect: (optionIndex: number) => void;
  scaleMap: Animated.Value[][];
  animateScale: (qIndex: number, oIndex: number) => void;
}) => (
  <View className="mb-8">
    <Text className="text-lg font-semibold text-green-700 mb-4">
      {title}
    </Text>

    <View className="flex-row">
      {options.map((o, i) => (
        <Option
          key={`${title}-${i}`}
          source={o.source}
          label={o.label}
          selected={value === i}
          scale={scaleMap[qIndex][i]}
          onPress={() => {
            animateScale(qIndex, i);
            onSelect(i);
          }}
        />
      ))}
    </View>
  </View>
);

/* =======================
   MAIN SCREEN
======================= */
export default function ProcessSection() {
  const questions: QuestionType[] = useMemo(
    () => [
      {
        title: '1. Physical Energy',
        options: [
          { source: EMOJI.veryGood, label: 'Very Good' },
          { source: EMOJI.good, label: 'Good' },
          { source: EMOJI.moderate, label: 'Moderate' },
          { source: EMOJI.bad, label: 'Bad' },
          { source: EMOJI.veryBad, label: 'Very Bad' },
        ],
      },
      {
        title: '2. Appetite',
        options: [
          { source: EMOJI.veryGood, label: 'Very Good' },
          { source: EMOJI.good, label: 'Good' },
          { source: EMOJI.moderate, label: 'Moderate' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '3. Body Weight',
        options: [
          { source: EMOJI.veryBad, label: 'Very Low' },
          { source: EMOJI.bad, label: 'Low' },
          { source: EMOJI.veryGood, label: 'Normal' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '4. Digestive Problems',
        options: [
          { source: EMOJI.veryGood, label: 'Very Good' },
          { source: EMOJI.good, label: 'Good' },
          { source: EMOJI.moderate, label: 'Moderate' },
          { source: EMOJI.bad, label: 'Bad' },
          { source: EMOJI.veryBad, label: 'Very Bad' },
        ],
      },
      {
        title: '5. Burning or Pain',
        options: [
          { source: EMOJI.veryGood, label: 'Very Good' },
          { source: EMOJI.good, label: 'Good' },
          { source: EMOJI.moderate, label: 'Moderate' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '6. Blood Pressure',
        options: [
          { source: EMOJI.moderate, label: 'Very Low' },
          { source: EMOJI.good, label: 'Low' },
          { source: EMOJI.veryGood, label: 'Normal' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '7. Fever',
        options: [
          { source: EMOJI.veryGood, label: 'Normal' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '8. Breathing Problem',
        options: [
          { source: EMOJI.veryGood, label: 'Normal' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '9. Skin Wellness',
        options: [
          { source: EMOJI.veryGood, label: 'Normal' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '10. Hair Problem',
        options: [
          { source: EMOJI.good, label: 'Very Low' },
          { source: EMOJI.veryGood, label: 'Low' },
          { source: EMOJI.moderate, label: 'Moderate' },
          { source: EMOJI.bad, label: 'High' },
          { source: EMOJI.veryBad, label: 'Very High' },
        ],
      },
      {
        title: '11. Sleep',
        options: [
          { source: EMOJI.good, label: '10 hr' },
          { source: EMOJI.veryGood, label: '8 hr' },
          { source: EMOJI.moderate, label: '6 hr' },
          { source: EMOJI.bad, label: '4 hr' },
          { source: EMOJI.veryBad, label: '2 hr' },
        ],
      },
    ],
    []
  );

  const TOTAL = questions.length;
  const [answers, setAnswers] = useState<number[]>(Array(TOTAL).fill(-1));
  const [scores, setScores] = useState<number[]>(Array(TOTAL).fill(0));

  const scaleMap = useRef(
    questions.map(q => q.options.map(() => new Animated.Value(1)))
  ).current;

  const animateScale = (qIndex: number, oIndex: number) => {
    Animated.sequence([
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 1.75,
        duration: 170,
        useNativeDriver: true,
      }),
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelect = (qIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });

    setScores(prev => {
      const next = [...prev];
      next[qIndex] = SCORE_MAP[optionIndex] ?? 0;
      return next;
    });
  };

  const calculateResult = () => {
    const validScores = scores.filter(v => v > 0);
    const avg =
      validScores.reduce((a, b) => a + b, 0) / validScores.length;

    let status = 'Needs Attention';
    if (avg >= 8) status = 'Excellent';
    else if (avg >= 6) status = 'Good';
    else if (avg >= 4) status = 'Fair';

    ToastAndroid.show(
      `Average Score: ${avg.toFixed(1)} (${status})`,
      ToastAndroid.LONG
    );
  };

  const answeredCount = answers.filter(v => v !== -1).length;
  const progress = Math.round((answeredCount / TOTAL) * 100);

  return (
    <View className="flex-1 bg-white px-4 pt-6">

      {/* Header */}
      <View className="mb-5">
        <Text className="text-base text-gray-500 mt-2 mb-2">
          {'< Let’s Get Started'}
        </Text>
        <Text className="text-3xl font-bold text-green-700">
          Process
        </Text>
        <Text className="text-base text-gray-600 mt-1">
          Answer the following questions
        </Text>
      </View>

      {/* Progress */}
      <View className="mb-5">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-2 bg-green-100 rounded-full">
            <View
              className="h-2 bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-base font-semibold text-green-700">
            {progress}%
          </Text>
        </View>
      </View>

      {/* Questions */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {questions.map((q, idx) => (
          <Question
            key={q.title}
            qIndex={idx}
            title={q.title}
            options={q.options}
            value={answers[idx]}
            onSelect={(opt) => handleSelect(idx, opt)}
            scaleMap={scaleMap}
            animateScale={animateScale}
          />
        ))}
      </ScrollView>

      {/* Submit */}
      <View className="mt-8 mb-14">
        <Pressable
          disabled={progress !== 100}
          onPress={calculateResult}
          className={`py-4 rounded-full ${
            progress === 100 ? 'bg-green-600' : 'bg-green-300'
          }`}
        >
          <Text className="text-lg font-semibold text-white text-center">
            Submit
          </Text>
        </Pressable>
      </View>

    </View>
  );
}
