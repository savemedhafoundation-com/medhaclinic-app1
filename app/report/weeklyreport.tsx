import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SvgHeader from "../../components/Clipperbg";
import {
  buildAndStoreWeeklyReport,
  type WeeklyReportStatus,
} from "../../services/medhaDataConnect";

// ---------------- HELPERS ----------------

const getStatusMeta = (score: number) => {
  if (score >= 8.5) {
    return {
      status: "Excellent",
      statusColor: "#16a34a",
      iconBg: "#dcfce7",
    };
  }
  if (score >= 7) {
    return {
      status: "Strong",
      statusColor: "#15803d",
      iconBg: "#dcfce7",
    };
  }
  if (score >= 5) {
    return {
      status: "Good",
      statusColor: "#ca8a04",
      iconBg: "#fef9c3",
    };
  }
  if (score >= 3) {
    return {
      status: "Needs Attention",
      statusColor: "#2563eb",
      iconBg: "#dbeafe",
    };
  }
  return {
    status: "Critical",
    statusColor: "#dc2626",
    iconBg: "#fee2e2",
  };
};

const formatDelta = (difference: number) => {
  if (difference > 0) return `+${difference.toFixed(1)} from last week`;
  if (difference < 0) return `${difference.toFixed(1)} from last week`;
  return `0.0 from last week`;
};

const getArrowIcon = (trend: string) => {
  if (trend === "up") return "arrow-up";
  if (trend === "down") return "arrow-down";
  return "remove";
};

const getArrowColor = (trend: string) => {
  if (trend === "up") return "#16a34a";
  if (trend === "down") return "#dc2626";
  return "#6b7280";
};

const getScoreDescription = (label: string, score: number, trend: string) => {
  const trendText =
    trend === "up"
      ? "showed improvement."
      : trend === "down"
      ? "showed decline."
      : "remained stable.";

  switch (label) {
    case "Physical Energy":
      return `Your physical energy ${trendText}`;
    case "Digestive Health":
      return `Your digestive condition ${trendText}`;
    case "Cardiovascular":
      return `Your cardiovascular health ${trendText}`;
    case "Immune Response":
      return `Your immune response ${trendText}`;
    case "Respiratory":
      return `Your respiratory condition ${trendText}`;
    case "Hormonal Health":
      return `Your hormonal balance ${trendText}`;
    default:
      return `Current score is ${score}.`;
  }
};

const getOverallInsight = (overallTrend: string) => {
  if (overallTrend === "up") {
    return "Clear overall progress is visible this week. Keep maintaining your routine and consistency.";
  }
  if (overallTrend === "down") {
    return "Some core areas declined this week. More consistency, hydration, rest, and symptom tracking are recommended.";
  }
  return "Your overall health pattern remained stable this week. Continue your present routine.";
};

const getImprovementInsight = (lowestScoreLabel: string) => {
  return `${lowestScoreLabel} needs the most attention this week. Focus on better daily routine, hydration, sleep, and consistent follow-up.`;
};

// ---------------- ICON MAP ----------------

const iconMap: Record<string, any> = {
  energyLevels: require("../../assets/images/immunity/physical1.png"),
  digestiveHealth: require("../../assets/images/report/digestive1.png"),
  cardiovascular: require("../../assets/images/report/cardiology1.png"),
  immuneResponse: require("../../assets/images/report/protection1.png"),
  respiratory: require("../../assets/images/report/respiratory1.png"),
  hormonalHealth: require("../../assets/images/report/hexagon1.png"),
};

// ---------------- SCORE LABEL MAP ----------------

const labelMap: Record<string, string> = {
  energyLevels: "Physical Energy",
  digestiveHealth: "Digestive Health",
  cardiovascular: "Cardiovascular",
  immuneResponse: "Immune Response",
  respiratory: "Respiratory",
  hormonalHealth: "Hormonal Health",
};

// ---------------- TYPES ----------------

type ScoreDifferenceItem = {
  current: number;
  previous: number;
  difference: number;
  trend: "up" | "down" | "same";
};

// ---------------- SCORE BADGE ----------------

const ScoreBadge = ({ score, bg }: { score: number; bg: string }) => (
  <View
    style={{
      backgroundColor: bg,
      borderRadius: 999,
      minWidth: 34,
      height: 34,
    }}
    className="items-center justify-center px-2 absolute -bottom-2 -right-2 shadow-sm"
  >
    <Text style={{ color: "#166534", fontSize: 11, fontWeight: "800" }}>
      {score.toFixed(1)}
    </Text>
  </View>
);

// ---------------- HEALTH CARD ----------------

const HealthCard = ({ item }: { item: any }) => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 mx-1 mb-3">
    <View className="flex-row items-center mb-2">
      <View
        style={{
          backgroundColor: item.iconBg,
          width: 48,
          height: 48,
          borderRadius: 24,
        }}
        className="items-center justify-center"
      >
        <Image
          source={item.icon}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
        <ScoreBadge score={item.score} bg={item.iconBg} />
      </View>

      <Text className="text-gray-800 font-bold text-[13px] ml-3 flex-1 leading-4">
        {item.label}
      </Text>
    </View>

    <Text
      style={{ color: item.statusColor }}
      className="font-bold text-[14px] mb-1"
    >
      {item.status}
    </Text>

    <Text className="text-gray-500 text-[11px] leading-4 mb-2">
      {item.description}
    </Text>

    <View className="flex-row items-center">
      <Ionicons
        name={getArrowIcon(item.trend)}
        size={12}
        color={getArrowColor(item.trend)}
      />
      <Text
        style={{ color: getArrowColor(item.trend) }}
        className="text-[11px] ml-1 font-medium"
      >
        {item.delta}
      </Text>
    </View>
  </View>
);

// ---------------- MAIN SCREEN ----------------

export default function WeeklyReportStatus() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<WeeklyReportStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeeklyReport();  
  }, []);

  const fetchWeeklyReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await buildAndStoreWeeklyReport();
      setReportData(data);
    } catch (err) {
      console.log("Weekly report fetch error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load weekly report";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const healthScores = useMemo(() => {
    if (!reportData?.scoreDifference) return [];

    return (
      Object.entries(reportData.scoreDifference) as Array<
        [keyof typeof reportData.scoreDifference, ScoreDifferenceItem]
      >
    ).map(([key, item]) => {
      const meta = getStatusMeta(item.current);

      return {
        id: String(key),
        label: labelMap[String(key)] || String(key),
        score: item.current,
        status: meta.status,
        statusColor: meta.statusColor,
        description: getScoreDescription(
          labelMap[String(key)],
          item.current,
          item.trend
        ),
        delta: formatDelta(item.difference),
        trend: item.trend,
        icon: iconMap[String(key)],
        iconBg: meta.iconBg,
      };
    });
  }, [reportData]);

  const lowestScoreItem = useMemo(() => {
    if (!healthScores.length) return null;
    return [...healthScores].sort((a, b) => a.score - b.score)[0];
  }, [healthScores]);

  const overallStatusMeta = useMemo(() => {
    if (!reportData?.overall) return null;
    return getStatusMeta(reportData.overall.current);
  }, [reportData]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#166534" />
        <Text className="text-gray-600 mt-4 text-[15px]">
          Loading weekly report...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !reportData) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
        <Text className="text-red-600 text-[18px] font-bold mt-4">
          Failed to load report
        </Text>
        <Text className="text-gray-500 text-center mt-2">{error}</Text>

        <TouchableOpacity
          onPress={fetchWeeklyReport}
          className="mt-6 bg-[#166534] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (                  
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row items-center justify-between">
              <Ionicons name="menu" size={26} color="#fff" />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 200,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 mt-6">
          <Text className="text-[#166534] text-[32px] font-extrabold leading-9">
            Weekly Report{"\n"}Status
          </Text>
          <Text className="text-gray-500 text-[15px] mt-3 leading-6">
            Here is your health report{"\n"}for the last 7 days
          </Text>
        </View>

        <View className="mx-5 mt-6 bg-[#166534] rounded-3xl p-5">
          <View className="absolute top-4 right-4 bg-white rounded-full px-3 py-1">
            <Text className="text-[#166534] text-[11px] font-bold">
              Weekly Overview
            </Text>
          </View>

          <View className="flex-row items-center mt-2">
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=12" }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
            <View className="ml-4 flex-1">
              <Text className="text-white text-[20px] font-extrabold">
                Weekly Summary
              </Text>
              <View className="mt-1">
                <Text className="text-green-200 text-[13px]">
                  Current Overall Score – {reportData.overall.current.toFixed(1)}
                </Text>
                <Text className="text-green-200 text-[13px] mt-1">
                  Previous Overall Score – {reportData.overall.previous.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row mt-4 gap-3">
            <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center">
              <Text className="text-[#166534] text-[22px] font-extrabold">7</Text>
              <Text className="text-gray-500 text-[11px] ml-2 leading-4">
                Days{"\n"}Tracked
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center">
              <Ionicons
                name={getArrowIcon(reportData.overall.trend)}
                size={22}
                color={getArrowColor(reportData.overall.trend)}
              />
              <View className="ml-2">
                <Text
                  style={{ color: overallStatusMeta?.statusColor || "#166534" }}
                  className="text-[16px] font-extrabold"
                >
                  {reportData.overall.difference > 0 ? "+" : ""}
                  {reportData.overall.difference.toFixed(1)}
                </Text>
                <Text className="text-gray-500 text-[11px]">Overall Change</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-4 mt-6 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-900 text-[20px] font-extrabold flex-1">
              Health Scores
            </Text>
            <View className="bg-gray-100 rounded-full px-3 py-1">
              <Text className="text-gray-500 text-[12px] font-medium">
                Past 7 days
              </Text>
            </View>
          </View>

          {Array.from({ length: Math.ceil(healthScores.length / 2) }).map(
            (_, rowIdx) => (
              <View key={rowIdx} className="flex-row">
                {healthScores
                  .slice(rowIdx * 2, rowIdx * 2 + 2)
                  .map((item) => (
                    <HealthCard key={item.id} item={item} />
                  ))}
              </View>
            )
          )}
        </View>

        <View className="mx-4 mt-5 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-[20px] font-extrabold mb-4">
            Key Insights
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-[#f0fdf4] rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                  <Ionicons name="analytics" size={14} color="#fff" />
                </View>
                <Text className="text-green-700 font-bold text-[13px]">
                  Overall Progress
                </Text>
              </View>
              <Text className="text-green-800 text-[12px] leading-5">
                {getOverallInsight(reportData.overall.trend)}
              </Text>
            </View>

            <View className="flex-1 bg-[#eff6ff] rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                  <Ionicons name="alert" size={14} color="#fff" />
                </View>
                <Text className="text-blue-700 font-bold text-[13px]">
                  Areas to Improve
                </Text>
              </View>
              <Text className="text-blue-800 text-[12px] leading-5">
                {lowestScoreItem
                  ? getImprovementInsight(lowestScoreItem.label)
                  : "No weak area detected."}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-center text-gray-500 text-[14px] mt-6 font-medium">
          Keep tracking your progress every week!
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          className="mx-6 mt-4 bg-[#166534] rounded-full py-4 items-center"
          style={{
            shadowColor: "#166534",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text className="text-white text-[16px] font-extrabold tracking-wide">
            Download PDF Report
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
