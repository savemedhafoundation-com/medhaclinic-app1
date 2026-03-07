import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
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

// ---------------------- API BASE URL ----------------------
const API_BASE_URL =
 "http://192.168.29.104:3000";

// ---------------------- QUESTIONS ----------------------
const QUESTIONS = [
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

// ---------------------- TYPES ----------------------
type OptionType = {
  key: string;
  label: string;
  img?: any;
  score: number;
};

type QuestionType = {
  id: string;
  title: string;
  options: OptionType[];
};

type AnswersType = Record<string, string>;

// ---------------------- RESULT HELPERS ----------------------
const getImmunityLabel = (score: number) => {
  if (score >= 8.5) {
    return {
      label: "Excellent Immunity",
      color: "#15803d",
      icon: "shield-checkmark",
      level: "excellent",
    };
  }

  if (score >= 7) {
    return {
      label: "Good Immunity",
      color: "#16a34a",
      icon: "thumbs-up",
      level: "good",
    };
  }

  if (score >= 5) {
    return {
      label: "Moderate Immunity",
      color: "#ca8a04",
      icon: "alert-circle",
      level: "medium",
    };
  }

  return {
    label: "Low Immunity",
    color: "#dc2626",
    icon: "warning",
    level: "low",
  };
};

const getScore = (questionId: string, answers: AnswersType): number => {
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return 0;

  const selectedKey = answers[questionId];
  if (!selectedKey) return 0;

  const selectedOption = question.options.find((opt) => opt.key === selectedKey);
  return selectedOption ? selectedOption.score : 0;
};

// ---------------------- ANIMATED OPTION ----------------------
const AnimatedOption = ({
  opt,
  selected,
  onPress,
}: {
  opt: OptionType;
  selected: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.15 : 1, {
      damping: 3,
      stiffness: 200,
    });
    glow.value = withTiming(selected ? 1 : 0, { duration: 120 });
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
  const [answers, setAnswers] = useState<AnswersType>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const progressPct = Math.round((totalAnswered / QUESTIONS.length) * 100);

  const speedometerValue = useMemo(() => {
    const scores: number[] = [];

    for (const q of QUESTIONS as QuestionType[]) {
      const picked = answers[q.id];
      if (!picked) continue;

      const opt = q.options.find((o) => o.key === picked);
      if (opt) scores.push(opt.score);
    }

    return scores.length
      ? Number(
          (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(2)
        )
      : 0;
  }, [answers]);

  const buildPostPayload = () => {
    const immunityMeta = getImmunityLabel(speedometerValue);

    return {
      phone: 8565412389,

      physicalEnergy: getScore("energy", answers),
      appetite: getScore("appetite", answers),
      digestionComfort: getScore("digestion", answers),
      burningPain: getScore("burning", answers),
      bloatingGas: getScore("bloating", answers),
      bloodPressure: getScore("pressure", answers),
      swelling: getScore("swelling", answers),
      fever: getScore("fever", answers),
      infection: getScore("infection", answers),
      breathingProblem: getScore("breathing", answers),
      menstrualRegularity: getScore("menstrual", answers),
      libidoStability: getScore("libido", answers),
      hairHealth: getScore("hair", answers),
      sleepHours: getScore("sleep", answers),

      immunityScore: speedometerValue,
      immunityLevel: immunityMeta.level,
    };
  };

  const buildResultPayload = () => {
    const payload = (QUESTIONS as QuestionType[]).map((q) => {
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

    const immunityMeta = getImmunityLabel(speedometerValue);

    const summary = {
      totalQuestions: QUESTIONS.length,
      totalAnswered,
      averageScore: speedometerValue,
      immunityLabel: immunityMeta.label,
      completionPercent: progressPct,
      submittedAt: new Date().toISOString(),
    };

    const speedometer = {
      score: speedometerValue,
      outOf: 10,
      label: immunityMeta.label,
      color: immunityMeta.color,
      icon: immunityMeta.icon,
      percentage: Math.round((speedometerValue / 10) * 100),
    };

    return { payload, summary, speedometer };
  };

  const submitDailyImmunityCheck = async () => {
    const postPayload = buildPostPayload();

    const response = await fetch(`${API_BASE_URL}/api/auth/daily-immunity-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postPayload),
    });

    const contentType = response.headers.get("content-type");

    let responseData: any = null;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        typeof responseData === "string"
          ? responseData
          : responseData?.message || "Failed to submit daily immunity check"
      );
    }

    return responseData;
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
      setIsSubmitting(true);

      const apiResponse = await submitDailyImmunityCheck();
      console.log("Daily immunity saved:", apiResponse);

      const { payload, summary, speedometer } = buildResultPayload();

      router.push({
        pathname: "certification/daily",
        params: {
          data: JSON.stringify(payload),
          summary: JSON.stringify(summary),
          speedometer: JSON.stringify(speedometer),
        },
      });
    } catch (error: any) {
      console.log("Submit error:", error);
      Alert.alert("Submission Failed", error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SvgHeader />

      <Text className="text-2xl font-extrabold text-green-800 mx-5">
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
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

        {/* Debug preview */}
        <View className="mt-4 mx-4 p-4 rounded-2xl bg-green-50 border border-green-100">
          <Text className="text-green-800 font-bold mb-2">Payload Preview</Text>
          <Text className="text-xs text-green-700">
            {JSON.stringify(buildPostPayload(), null, 2)}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleGetResult}
          disabled={isSubmitting}
          className={`mt-6 mx-4 rounded-2xl py-4 items-center shadow-md ${
            isSubmitting ? "bg-green-400" : "bg-green-600"
          }`}
          style={{
            shadowColor: "#16a34a",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name={isSubmitting ? "cloud-upload-outline" : "analytics-outline"}
              size={22}
              color="white"
            />
            <Text className="text-white text-lg font-extrabold ml-2">
              {isSubmitting ? "Submitting..." : "Get My Result"}
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