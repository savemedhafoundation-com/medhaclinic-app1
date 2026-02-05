import { useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

// Tick icon
import tick from '../assets/images/doubletick.png';

// Emoji assets - matching the image exactly
import good from '../assets/images/low.png';           // Dark green - Good
import veryGood from '../assets/images/normal.png';  // Light green - Very Good
import normal from '../assets/images/very-low.png';       // Yellow - Normal/Moderate
import bad from '../assets/images/high.png';             // Orange - Bad
import veryBad from '../assets/images/very-high.png';    // Red - Very Bad

/* ================= DATA ================= */

const QUESTIONS = [
  'Physical Energy',
  'Appetite',
  'Body Weight',
  'Digestive Problems',
  'Burning or Pain',
  'Blood Pressure',
  'Fever',
  'Breathing Problem',
  'Skin Health',
  'Hair Problem',
];

// Options matching image order: Good, Very Good, Normal, Bad, Very Bad
const OPTIONS = [
  { image: good, label: 'Good', score: 10 },        // Dark green
  { image: veryGood, label: 'Very Good', score: 8 }, // Light green
  { image: normal, label: 'Normal', score: 6 },      // Yellow
  { image: bad, label: 'Bad', score: 4 },            // Orange
  { image: veryBad, label: 'Very Bad', score: 2 },   // Red
];

/* ================= COMPONENT ================= */

export default function ProcessPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const scrollRef = useRef(null);
  const questionRefs = useRef([]);

  /* ===== Progress ===== */
  const completedCount = Object.keys(answers).length;
  const progressPercent = Math.round((completedCount / QUESTIONS.length) * 100);

  /* ===== Animation refs ===== */
  const scaleMap = useRef(
    QUESTIONS.map(() => OPTIONS.map(() => new Animated.Value(1)))
  ).current;

  const animateScale = (qIndex, oIndex) => {
    Animated.sequence([
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleMap[qIndex][oIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectOption = (qIndex, score, oIndex) => {
    animateScale(qIndex, oIndex);
    setAnswers(prev => ({ ...prev, [qIndex]: score }));
  };

  /* ===== Submit ===== */
  const submitAssessment = () => {
    const firstUnanswered = QUESTIONS.findIndex((_, idx) => answers[idx] === undefined);

    if (firstUnanswered !== -1) {
      scrollRef.current?.scrollTo({
        y: questionRefs.current[firstUnanswered] ?? 0,
        animated: true,
      });
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      total += answers[i];
    }
    const healthScore = total / QUESTIONS.length;
    const message = `Health Score: ${healthScore.toFixed(1)}/10`;

    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.CENTER);
    } else {
      Alert.alert('Your Health Result', message);
    }

    setTimeout(() => {
      router.push({
        pathname: '/certification',
        params: { healthScore: healthScore.toFixed(1) },
      });
    }, 1200);
  };

  return (
    <View className="flex-1 bg-white">
      {/* ===== GREEN HEADER ===== */}
      <LinearGradient colors={['#1DB306', '#0F8A0A']} className="pt-12 pb-6 px-4">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-2xl mr-2">{'<'}</Text>
          </TouchableOpacity>
          <Text className="text-white/90 text-[16px]">Let's Get Started</Text>
        </View>
        
        <Text className="text-[#0B6E0B] text-[32px] font-bold">Process</Text>
        <Text className="text-gray-700 text-[14px]">Answer the following questions</Text>
        
        {/* Progress Bar */}
        <View className="mt-4 flex-row items-center">
          <View className="flex-1 h-2.5 bg-white/30 rounded-full overflow-hidden mr-3">
            <View style={{ width: `${progressPercent}%` }} className="h-full bg-[#0B6E0B] rounded-full" />
          </View>
          <Text className="text-[#0B6E0B] text-[16px] font-bold">{progressPercent}%</Text>
        </View>
      </LinearGradient>

      {/* ===== QUESTIONS ===== */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {QUESTIONS.map((question, idx) => (
          <View
            key={idx}
            onLayout={e => (questionRefs.current[idx] = e.nativeEvent.layout.y)}
            className="mb-8"
          >
            <Text className="text-[18px] font-semibold text-[#0B6E0B] mb-4">
              {idx + 1}. {question}
            </Text>

            {/* Emoji Row - 5 options */}
            <View className="flex-row justify-between items-start">
              {OPTIONS.map((option, oIndex) => {
                const selected = answers[idx] === option.score;

                return (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => selectOption(idx, option.score, oIndex)}
                    activeOpacity={0.8}
                    className="items-center"
                    style={{ width: '18%' }}
                  >
                    {/* Emoji with animation */}
                    <Animated.View
                      style={{
                        transform: [{ scale: scaleMap[idx][oIndex] }],
                      }}
                    >
                      <Image
                        source={option.image}
                        style={{ width: 48, height: 48 }}
                        resizeMode="contain"
                      />
                    </Animated.View>

                    {/* Label below emoji */}
                    <Text className="text-[11px] text-center text-gray-600 mt-2 leading-3">
                      {option.label}
                    </Text>

                    {/* Checkmark when selected */}
                    {selected && (
                      <Image
                        source={tick}
                        style={{ width: 20, height: 20, marginTop: 4 }}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={submitAssessment}
          className="bg-[#1DB306] py-4 rounded-full my-6 flex-row items-center justify-center self-center px-12"
        >
          <Text className="text-white font-bold text-[18px] mr-2">Submit</Text>
          <Text className="text-white text-[20px]">{'>'}</Text>
        </TouchableOpacity>

        <Text className="text-gray-500 text-center text-[13px] mb-4">
          You can pause and resume anytime
        </Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#1DB306] flex-row justify-around py-4 px-6 rounded-t-3xl">
        <TouchableOpacity className="items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
          <Text className="text-white text-[20px]">🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
          <Text className="text-white text-[20px]">📊</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
          <Text className="text-white text-[20px]">💬</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
          <Text className="text-white text-[20px]">👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}