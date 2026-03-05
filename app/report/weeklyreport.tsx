import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SvgHeader from "../../components/Clipperbg";

// ─── HEALTH SCORE DATA ───────────────────────────────────────────────────────

const HEALTH_SCORES = [
  {
    id: "energy",
    label: "Physical Energy",
    score: 8.2,
    status: "Good",
    statusColor: "#ca8a04",
    description: "Your energy levels are improved and you feel more refreshed.",
    delta: "+0.3 from last week",
    icon: require("../../assets/images/immunity/physical1.png"),
    iconBg: "#fef9c3",
  },
  {
    id: "digestion",
    label: "Digestive Health",
    score: 8.3,
    status: "Excellent",
    statusColor: "#16a34a",
    description: "Your energy levels are improved and you feel more refreshed.",
    delta: "+0.9 from last week",
    icon: require("../../assets/images/report/digestive1.png"),
    iconBg: "#dcfce7",
  },
  {
    id: "cardio",
    label: "Cardiovascular",
    score: 8.2,
    status: "Stable",
    statusColor: "#dc2626",
    description: "Your cardiovascular health remained stable.",
    delta: "+0.1 from last week",
    icon: require("../../assets/images/report/cardiology1.png"),
    iconBg: "#fee2e2",
  },
  {
    id: "immune",
    label: "Immune Response",
    score: 9.1,
    status: "Strong",
    statusColor: "#16a34a",
    description: "High immune function with great resilience.",
    delta: "+0.3 from last week",
    icon: require("../../assets/images/report/protection1.png"),
    iconBg: "#dcfce7",
  },
  {
    id: "respiratory",
    label: "Respiratory",
    score: 6.1,
    status: "Needs Attention",
    statusColor: "#2563eb",
    description: "Slight decline in respiratory health this month.",
    delta: "+0.1 from last week",
    icon: require("../../assets/images/report/respiratory1.png"),
    iconBg: "#dbeafe",
  },
  {
    id: "hormonal",
    label: "Hormonal Health",
    score: 8.0,
    status: "Good",
    statusColor: "#ca8a04",
    description: "Hormonal level stayed regular and balanced.",
    delta: "+0.3 from last week",
    icon: require("../../assets/images/report/hexagon1.png"),
    iconBg: "#fef9c3",
  },
];

// ─── SCORE BADGE ─────────────────────────────────────────────────────────────

const ScoreBadge = ({ score, bg }: { score: number; bg: string }) => (
  <View
    style={{ backgroundColor: bg, borderRadius: 999, minWidth: 32, height: 32 }}
    className="items-center justify-center px-2 absolute -bottom-2 -right-2 shadow-sm"
  >
    <Text style={{ color: "#166534", fontSize: 11, fontWeight: "800" }}>
      {score}
    </Text>
  </View>
);

// ─── HEALTH SCORE CARD ────────────────────────────────────────────────────────

const HealthCard = ({ item }: { item: (typeof HEALTH_SCORES)[0] }) => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 mx-1 mb-3">
    {/* Icon + title row */}
    <View className="flex-row items-center mb-2">
      <View
        style={{ backgroundColor: item.iconBg, width: 48, height: 48, borderRadius: 24 }}
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

    {/* Status */}
    <Text style={{ color: item.statusColor }} className="font-bold text-[14px] mb-1">
      {item.status}
    </Text>

    {/* Description */}
    <Text className="text-gray-500 text-[11px] leading-4 mb-2">
      {item.description}
    </Text>

    {/* Delta */}
    <View className="flex-row items-center">
      <Ionicons name="arrow-up" size={12} color="#16a34a" />
      <Text className="text-green-700 text-[11px] ml-1 font-medium">
        {item.delta}
      </Text>
    </View>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function WeeklyReportStatus() {
  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* ── SVG Header ── */}
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
        {/* ── Page Title ── */}
        <View className="px-5 mt-6">
          <Text className="text-[#166534] text-[32px] font-extrabold leading-9">
            Weekly Report{"\n"}Status
          </Text>
          <Text className="text-gray-500 text-[15px] mt-3 leading-6">
            Here is your health report{"\n"}for the last 7 days
          </Text>
        </View>

        {/* ── Patient Overview Card ── */}
        <View className="mx-5 mt-6 bg-[#166534] rounded-3xl p-5">
          {/* Weekly Overview pill */}
          <View className="absolute top-4 right-4 bg-white rounded-full px-3 py-1">
            <Text className="text-[#166534] text-[11px] font-bold">
              Weekly Overview
            </Text>
          </View>

          {/* Avatar + info */}
          <View className="flex-row items-center mt-2">
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=12" }}
              style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "#fff" }}
            />
            <View className="ml-4">
              <Text className="text-white text-[20px] font-extrabold">
                John Doe
              </Text>
              <View className="flex-row mt-1">
                <Text className="text-green-200 text-[13px]">Age – 27 yrs</Text>
                <Text className="text-green-200 text-[13px] ml-3">Gender – Male</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View className="flex-row mt-4 gap-3">
            {/* Days Tracked */}
            <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center">
              <Text className="text-[#166534] text-[22px] font-extrabold">7</Text>
              <Text className="text-gray-500 text-[11px] ml-2 leading-4">
                Days{"\n"}Tracked
              </Text>
            </View>

            {/* Consistency */}
            <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center">
              <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
              <View className="ml-2">
                <Text className="text-[#166534] text-[16px] font-extrabold">96%</Text>
                <Text className="text-gray-500 text-[11px]">Consistency</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Health Scores ── */}
        <View className="mx-4 mt-6 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-900 text-[20px] font-extrabold flex-1">
              Health Scores
            </Text>
            <View className="bg-gray-100 rounded-full px-3 py-1">
              <Text className="text-gray-500 text-[12px] font-medium">Past 7 days</Text>
            </View>
          </View>

          {/* 2-column grid */}
          {Array.from({ length: Math.ceil(HEALTH_SCORES.length / 2) }).map((_, rowIdx) => (
            <View key={rowIdx} className="flex-row">
              {HEALTH_SCORES.slice(rowIdx * 2, rowIdx * 2 + 2).map((item) => (
                <HealthCard key={item.id} item={item} />
              ))}
            </View>
          ))}
        </View>

        {/* ── Key Insights ── */}
        <View className="mx-4 mt-5 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-[20px] font-extrabold mb-4">
            Key Insights
          </Text>

          <View className="flex-row gap-3">
            {/* Overall Progress */}
            <View className="flex-1 bg-[#f0fdf4] rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                  <Ionicons name="arrow-up" size={14} color="#fff" />
                </View>
                <Text className="text-green-700 font-bold text-[13px]">
                  Overall Progress
                </Text>
              </View>
              <Text className="text-green-800 text-[12px] leading-5">
                Clear progress shown in energy levels, physical comfort and digestive health. Keep up the consistency!
              </Text>
            </View>

            {/* Areas to Improve */}
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
                Your respiratory health slightly declined. Consider better air hygiene and staying hydrated.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Motivational text ── */}
        <Text className="text-center text-gray-500 text-[14px] mt-6 font-medium">
          Keep up the great work !
        </Text>

        {/* ── Download Button ── */}
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

      {/* ── Bottom Navigation ── */}

    </SafeAreaView>
  );
}