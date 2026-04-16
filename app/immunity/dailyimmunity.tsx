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
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { router } from "expo-router";

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from "../../components/ScreenNav";
import Speedometer from "../../components/Svgspeedometer";
import type { SubmitDailyImmunityVariables } from "../../firebase/dataConnect";
import { usePatientProfile } from "../../hooks/use-patient-profile";
import { useAuth } from "../../providers/AuthProvider";
import {
  buildImmunityAssessment,
  type AnsweredImmunityParameter,
  type ImmunityLevel,
} from "../../services/immunityScoring";
import {
  readAuthoritativeImmunityAssessment,
  saveDailyImmunitySubmission,
} from "../../services/medhaDataConnect";
import { goBackOrReplace } from "../../services/navigation";

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
  imageSize: number;
  labelFontSize: number;
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
        key: "mild",
        label: "Mild Fever",
        img: require("../../assets/images/immunity/fever2.png"),
        score: 10,
      },
      {
        key: "moderate",
        label: "Moderate Fever",
        img: require("../../assets/images/immunity/fever3.png"),
        score: 6,
      },
      {
        key: "high",
        label: "High Fever",
        img: require("../../assets/images/immunity/fever1.png"),
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
const getImmunityMeta = (level: ImmunityLevel) => {
  switch (level) {
    case "Excellent":
      return {
        label: "Excellent",
        color: "#15803d",
        icon: "shield-checkmark",
        apiLevel: "excellent" as const,
      };
    case "Good":
      return {
        label: "Good",
        color: "#16a34a",
        icon: "thumbs-up",
        apiLevel: "good" as const,
      };
    case "Moderate":
      return {
        label: "Moderate",
        color: "#ca8a04",
        icon: "alert-circle",
        apiLevel: "moderate" as const,
      };
    default:
      return {
        label: "Low",
        color: "#dc2626",
        icon: "warning",
        apiLevel: "low" as const,
      };
  }
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
const AnimatedOption = ({
  opt,
  selected,
  onPress,
  imageSize,
  labelFontSize,
}: AnimatedOptionProps) => {
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
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center"
      style={{ paddingHorizontal: imageSize <= 64 ? 2 : 4, minWidth: 0 }}
    >
      {opt.img && (
        <Animated.View style={animatedStyle}>
          <Image
            source={opt.img}
            style={{ width: imageSize, height: imageSize }}
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
          fontSize: labelFontSize,
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
  const { user } = useAuth();
  const { patientGenderKey } = usePatientProfile();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);

  const isCompactPhone = screenWidth < 380 || screenHeight < 760;
  const isVerySmallPhone = screenWidth < 360 || screenHeight < 700;
  const horizontalPadding = isVerySmallPhone ? 12 : 16;
  const contentTopPadding = SCREEN_NAV_CONTENT_PADDING_TOP;
  const contentBottomPadding = Math.max(60, insets.bottom + 28);
  const heroTitleSize = isVerySmallPhone ? 22 : isCompactPhone ? 24 : 26;
  const heroTitleLineHeight = isVerySmallPhone ? 26 : isCompactPhone ? 30 : 32;
  const heroSubtitleSize = isVerySmallPhone ? 15 : 16;
  const optionImageSize = isVerySmallPhone ? 64 : isCompactPhone ? 72 : 80;
  const optionLabelFontSize = isVerySmallPhone ? 12 : 13;
  const speedometerSize = Math.min(240, screenWidth - horizontalPadding * 2 - 20);

  const visibleQuestions = useMemo(() => {
    return QUESTIONS.filter((question) => {
      if (question.id === "menstrual") {
        return patientGenderKey !== "male";
      }

      if (question.id === "libido") {
        return patientGenderKey !== "female";
      }

      return true;
    });
  }, [patientGenderKey]);

  const totalQuestions = visibleQuestions.length;

  const totalAnswered = useMemo(() => {
    return visibleQuestions.reduce((count, question) => {
      return answers[question.id] ? count + 1 : count;
    }, 0);
  }, [answers, visibleQuestions]);

  const progressPct = totalQuestions
    ? Math.round((totalAnswered / totalQuestions) * 100)
    : 0;

  const answeredParameters = useMemo<AnsweredImmunityParameter[]>(() => {
    return visibleQuestions.flatMap((question) => {
      const selectedKey = answers[question.id];
      if (!selectedKey) {
        return [];
      }

      const selectedOption = question.options.find((option) => option.key === selectedKey);
      const apiField = API_FIELD_MAP[question.id];

      if (!selectedOption || !apiField) {
        return [];
      }

      return [
        {
          key: apiField,
          score: selectedOption.score,
          answered: true,
        },
      ];
    });
  }, [answers, visibleQuestions]);

  const assessment = useMemo(() => {
    return buildImmunityAssessment(answeredParameters, patientGenderKey);
  }, [answeredParameters, patientGenderKey]);

  const speedometerValue = assessment.immunityScore;
  const immunityMeta = useMemo(
    () => getImmunityMeta(assessment.level),
    [assessment.level]
  );

  const buildPayload = () => {
    return visibleQuestions.map((q) => {
      const selectedKey = answers[q.id] ?? null;
      const selectedOption = q.options.find((o) => o.key === selectedKey) ?? null;

      return {
        id: q.id,
        parameterKey: API_FIELD_MAP[q.id],
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

    visibleQuestions.forEach((q) => {
      const selectedKey = answers[q.id];
      if (!selectedKey) return;

      const selectedOption = q.options.find((o) => o.key === selectedKey);
      if (!selectedOption) return;

      const apiField = API_FIELD_MAP[q.id];
      if (apiField) {
        requestBody[apiField] = selectedOption.score;
      }
    });

    return {
      ...requestBody,
      immunityScore: assessment.roundedScore,
      immunityLevel: immunityMeta.apiLevel,
    };
  };

  const postImmunityData = async (requestBody: SubmitDailyImmunityVariables) => {
    return saveDailyImmunitySubmission(requestBody, user);
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

      const requestBody = buildApiRequestBody();
      const submissionResponse = await postImmunityData(requestBody);
      const authoritativeAssessment =
        readAuthoritativeImmunityAssessment(submissionResponse) ?? assessment;
      const authoritativeMeta = getImmunityMeta(authoritativeAssessment.level);
      const payload = buildPayload();

      const summary = {
        totalQuestions,
        totalAnswered,
        weightedScore: authoritativeAssessment.immunityScore,
        roundedScore: authoritativeAssessment.roundedScore,
        baseWeightedScore: authoritativeAssessment.baseWeightedScore,
        penaltyApplied: authoritativeAssessment.penaltyApplied,
        immunityLabel: authoritativeAssessment.level,
        systemScores: authoritativeAssessment.systemScores,
        weakestSystem: authoritativeAssessment.weakestSystem,
        strongestSystem: authoritativeAssessment.strongestSystem,
        hormonalParameterKeyUsed: authoritativeAssessment.hormonalParameterKeyUsed,
        completionPercent: progressPct,
        submittedAt: new Date().toISOString(),
      };

      const speedometer = {
        score: authoritativeAssessment.immunityScore,
        outOf: 10,
        roundedScore: authoritativeAssessment.roundedScore,
        label: authoritativeAssessment.level,
        color: authoritativeMeta.color,
        icon: authoritativeMeta.icon,
        percentage: Math.round((authoritativeAssessment.immunityScore / 10) * 100),
      };

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
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right", "bottom"]}>
      <ScreenNav onBackPress={() => goBackOrReplace('/(tabs)/dashboard')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: contentTopPadding,
          paddingBottom: contentBottomPadding,
          paddingHorizontal: horizontalPadding,
        }}
      >
        <Text
          className="font-extrabold text-green-800"
          style={{
            fontSize: heroTitleSize,
            lineHeight: heroTitleLineHeight,
            marginTop: isVerySmallPhone ? 10 : 12,
          }}
        >
          Daily Immunity{"\n"}Check
        </Text>

        <Text
          style={{
            fontSize: heroSubtitleSize,
            color: "#111827",
            marginTop: isVerySmallPhone ? 10 : 12,
          }}
        >
          Answer the following questions
        </Text>
  
      {/* Progress */}
      <View className="mt-5">
        <View className="h-2 bg-green-100 rounded-full overflow-hidden">
          <View
            style={{ width: `${progressPct}%` }}
            className="h-2 bg-green-600"
          />
        </View>
        <Text className="text-right text-green-700 mt-1">{progressPct}%</Text>
      </View>
        {visibleQuestions.map((q, idx) => (
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
                  imageSize={optionImageSize}
                  labelFontSize={optionLabelFontSize}
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
          <Speedometer score={speedometerValue} size={speedometerSize} />
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleGetResult}
          disabled={loading}
          className="mt-6 bg-green-600 rounded-2xl py-4 items-center shadow-md"
          style={{
            shadowColor: "#16a34a",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
            opacity: loading ? 0.7 : 1,
            marginHorizontal: isVerySmallPhone ? 4 : 8,
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
            {totalAnswered} of {totalQuestions} questions answered
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
