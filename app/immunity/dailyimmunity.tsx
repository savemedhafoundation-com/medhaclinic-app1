import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  type ImageSourcePropType,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { router } from "expo-router";

import SvgHeader from "../../components/Clipperbg";
import Speedometer from "../../components/Svgspeedometer";
import type { SubmitDailyImmunityVariables } from "../../firebase/dataConnect";
import { saveDailyImmunitySubmission } from "../../services/medhaDataConnect";

type QuestionId =
  | "energy"
  | "appetite"
  | "digestion"
  | "burning"
  | "bloating"
  | "pressure"
  | "swelling"
  | "fever"
  | "infection"
  | "breathing"
  | "menstrual"
  | "libido"
  | "hair"
  | "sleep";

type QuestionOption = {
  key: string;
  label: string;
  img: ImageSourcePropType;
  score: number;
};

type Question = {
  id: QuestionId;
  title: string;
  options: QuestionOption[];
};

type Answers = Partial<Record<QuestionId, string>>;

type AnimatedOptionProps = {
  opt: QuestionOption;
  selected: boolean;
  onPress: () => void;
};

// ---------------------- QUESTIONS ----------------------
const QUESTIONS: Question[] = [
  {
    id: "energy",
    title: "Physical Energy",
    options: [
      {
        key: "good",
        label: "Good Energy",
        img: require("../../assets/images/immunity/physical1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Poor Energy",
        img: require("../../assets/images/immunity/physical2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Very Poor Energy",
        img: require("../../assets/images/immunity/physical3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "appetite",
    title: "Appetite",
    options: [
      {
        key: "good",
        label: "Good Appetite",
        img: require("../../assets/images/immunity/appetite1.png"),
        score: 10,         
      },
      {
        key: "poor",
        label: "Poor Appetite",
        img: require("../../assets/images/immunity/appetite2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Very Poor Appetite",
        img: require("../../assets/images/immunity/appetite3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "digestion",
    title: "Digestion Comfort",
    options: [
      {
        key: "good",
        label: "Good Digestion",
        img: require("../../assets/images/immunity/digestion1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Poor Digestion",
        img: require("../../assets/images/immunity/digestion2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Very Poor Digestion",
        img: require("../../assets/images/immunity/digestion3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "burning",
    title: "Burning / Pain",
    options: [
      {
        key: "good",
        label: "Good Comfort",
        img: require("../../assets/images/immunity/burning1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Poor Pain",
        img: require("../../assets/images/immunity/burning2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Very Poor Pain",
        img: require("../../assets/images/immunity/burning3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "bloating",
    title: "Bloating or Gas",
    options: [
      {
        key: "good",
        label: "Good Comfort",
        img: require("../../assets/images/immunity/bloating1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Poor Bloating",
        img: require("../../assets/images/immunity/bloating2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Severe Bloating",
        img: require("../../assets/images/immunity/bloating3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "pressure",
    title: "Blood Pressure",
    options: [
      {
        key: "low",
        label: "Low",
        img: require("../../assets/images/immunity/pressure1.png"),
        score: 6,
      },
      {
        key: "normal",
        label: "Normal",
        img: require("../../assets/images/immunity/pressure2.png"),
        score: 10,
      },
      {
        key: "high",
        label: "High",
        img: require("../../assets/images/immunity/pressure3.png"),
        score: 6,
      },
    ],
  },
  {
    id: "swelling",
    title: "Swelling",
    options: [
      {
        key: "none",
        label: "None",
        img: require("../../assets/images/immunity/swelling1.png"),
        score: 10,
      },
      {
        key: "mild",
        label: "Mild Swelling",
        img: require("../../assets/images/immunity/swelling2.png"),
        score: 6,
      },
      {
        key: "severe",
        label: "Severe Swelling",
        img: require("../../assets/images/immunity/swelling3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "fever",
    title: "Fever",
    options: [
      {
        key: "none",
        label: "No Fever",
        img: require("../../assets/images/immunity/fever1.png"),
        score: 10,
      },
      {
        key: "mild",
        label: "Moderate Fever",
        img: require("../../assets/images/immunity/fever2.png"),
        score: 6,
      },
      {
        key: "high",
        label: "High Fever",
        img: require("../../assets/images/immunity/fever3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "infection",
    title: "Infection",
    options: [
      {
        key: "none",
        label: "No Infection",
        img: require("../../assets/images/immunity/infection1.png"),
        score: 10,
      },
      {
        key: "mild",
        label: "Mild Infection",
        img: require("../../assets/images/immunity/infection2.png"),
        score: 6,
      },
      {
        key: "severe",
        label: "Severe Infection",
        img: require("../../assets/images/immunity/infection3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "breathing",
    title: "Breathing Problem",
    options: [
      {
        key: "good",
        label: "Normal Breathing",
        img: require("../../assets/images/immunity/breathing1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Mild Difficulty",
        img: require("../../assets/images/immunity/breathing2.png"),
        score: 6,
      },
      {
        key: "severe",
        label: "Severe Difficulty",
        img: require("../../assets/images/immunity/breathing3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "menstrual",
    title: "Menstrual Regularity (Female)",
    options: [
      {
        key: "regular",
        label: "Regular",
        img: require("../../assets/images/immunity/menstural1.png"),
        score: 10,
      },
      {
        key: "irregular",
        label: "Irregular",
        img: require("../../assets/images/immunity/menstural2.png"),
        score: 6,
      },
      {
        key: "severe",
        label: "Severely Irregular",
        img: require("../../assets/images/immunity/menstural3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "libido",
    title: "Libido Stability (Male)",
    options: [
      {
        key: "good",
        label: "Stable",
        img: require("../../assets/images/immunity/lipid1.png"),
        score: 10,
      },
      {
        key: "poor",
        label: "Low Stability",
        img: require("../../assets/images/immunity/lipid2.png"),
        score: 6,
      },
      {
        key: "verypoor",
        label: "Very Low Stability",
        img: require("../../assets/images/immunity/lipid2.png"),
        score: 3,
      },
    ],
  },
  {
    id: "hair",
    title: "Hair Health",
    options: [
      {
        key: "strong",
        label: "Strong Hair",
        img: require("../../assets/images/immunity/hair1.png"),
        score: 10,
      },
      {
        key: "dry",
        label: "Dry Hair",
        img: require("../../assets/images/immunity/hair2.png"),
        score: 6,
      },
      {
        key: "damaged",
        label: "Damaged Hair",
        img: require("../../assets/images/immunity/hair3.png"),
        score: 3,
      },
    ],
  },
  {
    id: "sleep",
    title: "Sleep Duration",
    options: [
      {
        key: "10h",
        label: "10 Hours or More",
        img: require("../../assets/images/immunity/sleep3.png"),
        score: 4,
      },
      {
        key: "8h",
        label: "8 Hours",
        img: require("../../assets/images/immunity/sleep4.png"),
        score: 6,
      },
      {
        key: "6h",
        label: "6 Hours",
        img: require("../../assets/images/immunity/sleep2.png"),
        score: 10,
      },
      {
        key: "4h",
        label: "4 Hours",
        img: require("../../assets/images/immunity/sleep3.png"),
        score: 3,
      },
    ],
  },
];

// ---------------------- RESULT HELPERS ----------------------
const getImmunityLabel = (score: number) => {
  if (score >= 8.5) {
    return {
      label: "Excellent Immunity",
      color: "#15803d",
      icon: "shield-checkmark",
      apiLevel: "high" as const,
    };
  }
  if (score >= 7) {
    return {
      label: "Good Immunity",
      color: "#16a34a",
      icon: "thumbs-up",
      apiLevel: "good" as const,
    };
  }
  if (score >= 5) {
    return {
      label: "Moderate Immunity",
      color: "#ca8a04",
      icon: "alert-circle",
      apiLevel: "medium" as const,
    };
  }
  return {
    label: "Low Immunity",
    color: "#dc2626",
    icon: "warning",
    apiLevel: "low" as const,
  };
};

// ---------------------- MAP FRONTEND QUESTION IDS TO API KEYS ----------------------
const API_FIELD_MAP: Record<
  QuestionId,
  Exclude<keyof SubmitDailyImmunityVariables, "immunityScore" | "immunityLevel">
> = {
  energy: "physicalEnergy",
  appetite: "appetite",
  digestion: "digestionComfort",
  burning: "burningPain",
  bloating: "bloatingGas",
  pressure: "bloodPressure",
  swelling: "swelling",
  fever: "fever",
  infection: "infection",
  breathing: "breathingProblem",
  menstrual: "menstrualRegularity",
  libido: "libidoStability",
  hair: "hairHealth",
  sleep: "sleepHours",
};

// ---------------------- ANIMATED OPTION ----------------------
const AnimatedOption = ({ opt, selected, onPress }: AnimatedOptionProps) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.15 : 1, {
      damping: 3,
      stiffness: 200,
    });
    glow.value = withTiming(selected ? 1 : 0, { duration: 50 });
  }, [selected, scale, glow]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glow.value, [0, 1], [0, 0.4]);
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      shadowRadius: selected ? 8 : 0,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center px-1">
      {opt.img && (
        <Animated.View style={animatedStyle}>
          <Image
            source={opt.img}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <Text
        style={{
          color:
            opt.score >= 9 ? "#16a34a" : opt.score >= 6 ? "#ca8a04" : "#dc2626",
          fontWeight: "700",
          marginTop: 4,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        {opt.label}
      </Text>

      {selected && (
        <View style={{ marginTop: 6 }}>
          <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ---------------------- MAIN SCREEN ----------------------
export default function DailyImmunityCheck() {
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const progressPct = Math.round((totalAnswered / QUESTIONS.length) * 100);

  const speedometerValue = useMemo(() => {
    const scores = [];

    for (const q of QUESTIONS) {
      const picked = answers[q.id];
      if (!picked) continue;

      const opt = q.options.find((o) => o.key === picked);
      if (opt) scores.push(opt.score);
    }

    return scores.length
      ? Number(
          (scores.reduce((total, value) => total + value, 0) / scores.length).toFixed(2)
        )
      : 0;
  }, [answers]);

  const buildPayload = () => {
    return QUESTIONS.map((q) => {
      const selectedKey = answers[q.id] ?? null;
      const selectedOption = q.options.find((o) => o.key === selectedKey) ?? null;

      return {
        id: q.id,
        title: q.title,
        selectedKey,
        selectedLabel: selectedOption?.label ?? null,
        score: selectedOption?.score ?? null,
        answered: !!selectedKey,
      };
    });
  };

  const buildApiRequestBody = (): SubmitDailyImmunityVariables => {
    const requestBody: Partial<SubmitDailyImmunityVariables> = {};

    QUESTIONS.forEach((q) => {
      const selectedKey = answers[q.id];
      if (!selectedKey) return;

      const selectedOption = q.options.find((o) => o.key === selectedKey);
      if (!selectedOption) return;

      const apiField = API_FIELD_MAP[q.id];
      if (apiField) {
        requestBody[apiField] = selectedOption.score;
      }
    });

    const immunityMeta = getImmunityLabel(speedometerValue);

    return {
      ...requestBody,
      immunityScore: Number(speedometerValue.toFixed(0)),
      immunityLevel: immunityMeta.apiLevel,
    };
  };

  const postImmunityData = async (requestBody: SubmitDailyImmunityVariables) => {
    await saveDailyImmunitySubmission(requestBody);
  };

  const handleGetResult = async () => {
    if (totalAnswered === 0) {
      Alert.alert(
        "No Answers",
        "Please answer at least one question before viewing results."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = buildPayload();

      const summary = {
        totalQuestions: QUESTIONS.length,
        totalAnswered,
        averageScore: speedometerValue,
        immunityLabel: getImmunityLabel(speedometerValue).label,
        completionPercent: progressPct,
        submittedAt: new Date().toISOString(),
      };

      const speedometer = {
        score: speedometerValue,
        outOf: 10,
        label: getImmunityLabel(speedometerValue).label,
        color: getImmunityLabel(speedometerValue).color,
        icon: getImmunityLabel(speedometerValue).icon,
        percentage: Math.round((speedometerValue / 10) * 100),
      };

      const requestBody = buildApiRequestBody();

      await postImmunityData(requestBody);

      router.push(
        {
          pathname: "/certification/daily",
          params: {
            data: JSON.stringify(payload),
            summary: JSON.stringify(summary),
            speedometer: JSON.stringify(speedometer),
            apiSaved: "true",
          },
        } as never
      );
    } catch (error) {
      console.log("Data Connect daily immunity error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving data.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
          <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>

              <Ionicons name="menu" size={26} color="#fff" />
            </View>

         
          </View>
        </SafeAreaView>
      </View>

  

      <ScrollView contentContainerStyle={{  paddingTop: 110,
          paddingBottom: 60,
          paddingHorizontal: 16,}}>


            <Text className="text-2xl font-extrabold text-green-800 mx-5 mt-20">
        Daily Immunity Check
      </Text>
  
      {/* Progress */}
      <View className="mt-4 mx-5">
        <View className="h-2 bg-green-100 rounded-full overflow-hidden">
          <View
            style={{ width: `${progressPct}%` }}
            className="h-2 bg-green-600"
          />
        </View>
        <Text className="text-right text-green-700 mt-1">{progressPct}%</Text>
      </View>
        {QUESTIONS.map((q, idx) => (
          <View key={q.id} className="mt-6">
            <Text className="font-bold text-green-800 mb-2">
              {idx + 1}. {q.title}
            </Text>

            <View className="flex-row justify-between">
              {q.options.map((opt) => (
                <AnimatedOption
                  key={opt.key}
                  opt={opt}
                  selected={answers[q.id] === opt.key}
                  onPress={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt.key,
                    }))
                  }
                />
              ))}
            </View>
          </View>
        ))}

        {/* Speedometer */}
        <View className="mt-8">
          <Speedometer score={speedometerValue} />
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleGetResult}
          disabled={loading}
          className="mt-6 mx-4 bg-green-600 rounded-2xl py-4 items-center shadow-md"
          style={{
            shadowColor: "#16a34a",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <View className="flex-row items-center">
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="analytics-outline" size={22} color="white" />
            )}

            <Text className="text-white text-lg font-extrabold ml-2">
              {loading ? "Saving..." : "Get My Result"}
            </Text>
          </View>

          <Text className="text-green-100 text-xs mt-1">
            {totalAnswered} of {QUESTIONS.length} questions answered
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
