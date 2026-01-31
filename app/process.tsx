import { useRef, useState, useMemo } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useRouter } from 'expo-router';

// Tick icon
import tick from '../assets/images/doubletick.png';

// Emoji assets
import veryLow from '../assets/images/very-low.png';
import low from '../assets/images/low.png';
import normal from '../assets/images/normal.png';
import high from '../assets/images/high.png';
import veryHigh from '../assets/images/very-high.png';

/* ================= DATA ================= */

const QUESTIONS = [
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
  'Breast Health',      // index 19
  'Menstruation',       // index 20
  'Sexual Health',
  'Memory Health',
];

const OPTIONS = [
  { image: veryLow, label: 'Very Low', score: 10 },
  { image: low, label: 'Low', score: 8 },
  { image: normal, label: 'Normal', score: 6 },
  { image: high, label: 'High', score: 4 },
  { image: veryHigh, label: 'Very High', score: 2 },
];

/* ================= COMPONENT ================= */

export default function ProcessPage() {
  const router = useRouter();

  const [gender, setGender] = useState('female'); // 'male' | 'female'
  const [answers, setAnswers] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const scrollRef = useRef(null);
  const questionRefs = useRef([]);

  /* ===== FILTER QUESTIONS BASED ON GENDER ===== */
  const visibleQuestions = useMemo(() => {
    if (gender === 'male') {
      return QUESTIONS.filter(
        q => q !== 'Breast Health' && q !== 'Menstruation'
      );
    }
    return QUESTIONS;
  }, [gender]);

  /* ===== Progress ===== */
  const completedCount = Object.keys(answers).length;
  const progressPercent =
    (completedCount / visibleQuestions.length) * 100;

  /* ===== Animation refs ===== */
  const scaleMap = useRef(
    QUESTIONS.map(() =>
      OPTIONS.map(() => new Animated.Value(1))
    )
  ).current;

  const animateScale = (qIndex, oIndex) => {
    Animated.sequence([
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectOption = (qIndex, score, oIndex) => {
    animateScale(qIndex, oIndex);
    setAnswers(prev => ({
      ...prev,
      [qIndex]: score,
    }));
  };

  /* ===== Submit ===== */
  const submitAssessment = () => {
    setShowErrors(true);

    const firstUnanswered = visibleQuestions.findIndex(
      (_, idx) => answers[idx] === undefined
    );

    if (firstUnanswered !== -1) {
      scrollRef.current?.scrollTo({
        y: questionRefs.current[firstUnanswered] ?? 0,
        animated: true,
      });

      Alert.alert(
        'Incomplete',
        'Please answer all required questions'
      );
      return;
    }

    let total = 0;
    for (let i = 0; i < visibleQuestions.length; i++) {
      total += answers[i];
    }

    const healthScore = total / visibleQuestions.length;
    const immunityIndex =
      visibleQuestions.indexOf('Immunity');
    const immunityScore =
      answers[immunityIndex] ?? 6;

    const message = `Health Score: ${healthScore.toFixed(
      1
    )}/10 | Immunity Score: ${immunityScore.toFixed(1)}/10`;

    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    } else {
      Alert.alert('Your Health Result', message);
    }

    setTimeout(() => {
      router.push({
        pathname: '/certification',
        params: {
          healthScore: healthScore.toFixed(1),
          immunityScore: immunityScore.toFixed(1),
          gender,
        },
      });
    }, 1200);
  };

  return (
    <View className="flex-1 bg-[#F5FAFF] pt-10 px-2">
      {/* ===== HEADER ===== */}
      <Text className="text-[32px] font-bold text-[#0B4F8A] mt-6">
        Process
      </Text>

      {/* ===== PROGRESS BAR ===== */}
      <View className="mt-4 mb-3">
        <View className="h-3 bg-[#D6E6F5] rounded-full overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-3 bg-[#0B4F8A]"
          />
        </View>
        <Text className="text-sm text-gray-600 mt-1">
          Completed {completedCount} / {visibleQuestions.length}
        </Text>
      </View>

      {/* ===== GENDER RADIO ===== */}
      <View className="flex-row items-center mb-4">
        {['male', 'female'].map(g => (
          <TouchableOpacity
            key={g}
            onPress={() => {
              setGender(g);
              setAnswers({});
              setShowErrors(false);
            }}
            className="flex-row items-center mr-6"
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-2 ${
                gender === g
                  ? 'border-[#0B4F8A]'
                  : 'border-gray-400'
              }`}
            >
              {gender === g && (
                <View className="w-3 h-3 bg-[#0B4F8A] rounded-full m-auto" />
              )}
            </View>
            <Text className="text-lg capitalize">
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-[30px] text-gray-600 mb-4">
        Answer the following questions
      </Text>

      {/* ===== QUESTIONS ===== */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {visibleQuestions.map((question, idx) => (
          <View
            key={idx}
            onLayout={e =>
              (questionRefs.current[idx] =
                e.nativeEvent.layout.y)
            }
            className="mb-5"
          >
            <Text className="text-[18px] font-semibold text-gray-800 mb-2">
              {idx + 1}. {question}
              {showErrors &&
                answers[idx] === undefined && (
                  <Text className="text-red-600"> *</Text>
                )}
            </Text>

            <View className="flex-row justify-between mt-1">
              {OPTIONS.map((option, oIndex) => {
                const selected =
                  answers[idx] === option.score;

                return (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() =>
                      selectOption(
                        idx,
                        option.score,
                        oIndex
                      )
                    }
                    className={`items-center h-[128px] justify-between' : 'opacity-70'
                    }`}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            scale:
                              scaleMap[idx][oIndex],
                          },
                        ],
                      }}
                    >
                      <Image
                        source={option.image}
                        className="w-14 h-14"
                      />
                    </Animated.View>

                    <Text className="text-[18px] mt-1">
                      {option.label}
                    </Text>

                    {selected && (
                      <Image
                        source={tick}
                        className="w-8 h-8 mt-1"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ===== SUBMIT ===== */}
        <TouchableOpacity
          onPress={submitAssessment}
          className="bg-[#0B4F8A] py-4 rounded-full my-8"
        >
          <Text className="text-white text-center font-semibold text-base">
            Submit
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
