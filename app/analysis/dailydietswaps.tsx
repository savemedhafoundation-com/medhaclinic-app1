import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyDietSwapsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F6FFF5]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ================= HEADER ================= */}
        <View className="bg-green-600 rounded-b-[28px] px-5 pt-6 pb-10">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity>
              <Ionicons name="menu" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text className="text-white/80 text-sm">
            Step-by-Step Analysis & Recommendations
          </Text>

          <Text className="text-white text-[26px] font-extrabold mt-2">
            Daily Diet Swaps
          </Text>

          <Text className="text-white/90 mt-2">
            Select your foods in order to know your health better.
          </Text>

          <TouchableOpacity className="bg-white self-start mt-4 px-5 py-2 rounded-full flex-row items-center">
            <Ionicons name="calendar" size={16} color="#16a34a" />
            <Text className="ml-2 text-green-700 font-semibold">
              Today
            </Text>
            <Ionicons name="chevron-down" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* ================= DAILY INTAKE ================= */}
        <View className="mx-5 mt-6 bg-green-200 rounded-[24px] p-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-green-800 font-bold text-[16px]">
                Daily Intake
              </Text>
              <Text className="text-green-900 text-[26px] font-extrabold mt-1">
                75%
              </Text>
              <Text className="text-green-700 text-[12px] mt-1">
                Recommendation{'\n'}To intake 1500 kcal
              </Text>
            </View>

            <View className="w-24 h-24 rounded-full border-[10px] border-green-600 items-center justify-center bg-white">
              <Text className="text-green-800 font-bold">1100</Text>
              <Text className="text-gray-500 text-[11px]">1500 kcal</Text>
            </View>
          </View>
        </View>

        {/* ================= MEALS ================= */}
        <View className="mx-5 mt-6">
          <Text className="text-green-700 font-bold mb-3">
            Select your daily food habits.
          </Text>

          <MealCard title="Breakfast" kcal="452 - 512 kcal" />
          <MealCard title="Lunch Time" kcal="452 - 512 kcal" />
          <MealCard title="Dinner" kcal="452 - 512 kcal" />
        </View>

        {/* ================= SUBMIT ================= */}
        <TouchableOpacity className="mx-5 mt-6 bg-green-600 py-4 rounded-full items-center">
          <Text className="text-white font-bold text-[16px]">
            Submit Your Data
          </Text>
        </TouchableOpacity>

        {/* ================= CALORIE OVERVIEW ================= */}
        <View className="mx-5 mt-8 bg-green-700 rounded-[24px] p-5">
          <View className="flex-row justify-between mb-3">
            <Text className="text-white font-bold text-[18px]">
              Calories
            </Text>
            <Text className="text-white/80">
              Target - 1500kcal
            </Text>
          </View>

          <Text className="text-white text-[26px] font-extrabold mb-4">
            1100 Kcal
          </Text>

          {[
            { day: 'Mon', value: 44 },
            { day: 'Tue', value: 60 },
            { day: 'Wed', value: 39 },
            { day: 'Thu', value: 58 },
            { day: 'Fri', value: 100 },
            { day: 'Sat', value: 82 },
            { day: 'Sun', value: 59 },
          ].map((item) => (
            <View key={item.day} className="mb-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white">{item.day}</Text>
                <Text className="text-white">{item.value}%</Text>
              </View>
              <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                <View
                  className="h-2 bg-green-300 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ================= QUICK EXERCISE ================= */}
        <View className="mx-5 mt-8 bg-green-600 rounded-[24px] p-5">
          <Text className="text-white font-bold mb-3">
            Quick suggestions for exercise
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {[
              '20 minutes a day',
              'Jogging (15min)',
              'Cycling (15min)',
              'Swimming (15min)',
              'Just stay active',
              'Jump rope (10min)',
            ].map((item) => (
              <Text
                key={item}
                className="text-white text-[13px] mb-2 w-[48%]"
              >
                • {item}
              </Text>
            ))}
          </View>

          <Text className="text-white/90 text-[12px] mt-2">
            * You need to do all of this for 1.5 hrs
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= MEAL CARD ================= */

function MealCard({
  title,
  kcal,
}: {
  title: string;
  kcal: string;
}) {
  return (
    <View className="bg-white rounded-[18px] p-4 flex-row justify-between items-center mb-3 shadow-sm">
      <View>
        <Text className="font-bold text-green-800">
          {title}
        </Text>
        <Text className="text-green-600 text-[12px] mt-1">
          {kcal}
        </Text>
      </View>

      <TouchableOpacity className="bg-green-600 w-10 h-10 rounded-full items-center justify-center">
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
