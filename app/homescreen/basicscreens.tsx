import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SvgHeader from '../../components/Clipperbg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { goBackOrReplace } from '../../services/navigation';

export default function GetStartedScreen() {
  const CHECKUPS = [
    {
      title: "Daily Immunity Checkup",
      sub: "Know your daily health reports",
      route: "immunity/dailyimmunity",
      type: "daily",
    },
    {
      title: "Weekly Immunity Report",
      sub: "Know your weekly health reports",
      route: "report/weeklyreport",       // ✅ fixed
      type: "report",
    },
    {
      title: "Monthly Immunity Report",
      sub: "Know your monthly health reports",
      route: "/immunity/dailyimmunity",
      type: "report",
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">

      {/* ===== HEADER ===== */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => goBackOrReplace('/(tabs)/dashboard')}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: 200,
          paddingBottom: 140,
        }}
      >
        {/* Section Title */}
        <Text className="text-gray-500 text-base mb-2">
          {'<'} Basic Health Assessment
        </Text>

        <Text className="text-green-700 text-3xl font-bold">
          Let’s Get started
        </Text>

        <Text className="text-gray-700 text-lg mt-3 leading-6">
          Please tell us a bit about yourself so we can guide your health journey.
        </Text>

        {/* Progress */}
        <View className="mt-6">
          <View className="h-3 bg-green-200 rounded-full">
            <View className="w-1/3 h-3 bg-green-600 rounded-full" />
          </View>
          <Text className="text-green-700 mt-2 font-medium">
            Step 1 of 3
          </Text>
        </View>

        {/* ===== CARDS ===== */}
        <View className="mt-8">
          {CHECKUPS.map((item, index, arr) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => router.push(item.route)}
              className={`bg-green-600 rounded-2xl p-5 flex-row items-center justify-between ${
                index !== arr.length - 1 ? "mb-8" : ""
              }`}
            >
              <View>
                <Text className="text-white text-lg font-semibold">
                  {item.title}
                </Text>
                <Text className="text-green-100 mt-1">
                  {item.sub}
                </Text>
              </View>

              {/* 🔥 Conditional Button Text */}
              <View className="bg-white px-4 py-2 rounded-full">
                <Text className="text-green-700 font-semibold">
                  {item.type === "daily" ? "Get Started" : "Get Report"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View className="bg-green-200 p-5 rounded-2xl mt-10">
          <Text className="text-gray-800 text-center leading-6">
            All fields are optional, but more information means better care for you.
            Your details will remain confidential.
          </Text>
        </View>

      </ScrollView>

      <BottomNav />
    </View>
  );
}
