import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgHeader from "../../components/Clipperbg";
import BottomNav from "../../components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const mainImage = require("../../assets/images/dietheader.png");

export default function BoosterDietScreen() {
  return (
    <View className="flex-1 bg-gray-100">

      {/* ===== HEADER ===== */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 mt-4 flex-row items-center justify-between px-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Ionicons name="menu" size={26} color="#fff" />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 200, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >

        {/* MAIN IMAGE */}
        <View className="items-center">
          <Image
            source={mainImage}
            className="w-156 h-156"
            resizeMode="cover"
          />
        </View>

        {/* TITLE */}
        <Text className="text-green-700 text-xl font-bold mt-4">
          30-Day Boosters & Diet Plan
        </Text>

        <Text className="text-gray-700 mt-2 leading-6">
          A special 30-day booster & diet plan designed to support thyroid,
          immunity, anemia, bone strength, liver metabolism, and overall well-being.
        </Text>

        {/* ===== PART 1 DIET PLAN ===== */}
        <TouchableOpacity className="bg-green-600 mt-6 py-3 rounded-full items-center">
          <Text className="text-white font-semibold">
             Diet Plan (30 day)
          </Text>
        </TouchableOpacity>

        <Text className="text-red-600 font-semibold mt-4">
          Very Important –
        </Text>
        <Text className="text-gray-700">
          Without proper diet, Hb and cholesterol will not improve.
        </Text>

        {/* Early Morning */}
        <View className="bg-white rounded-2xl p-4 mt-6 shadow-sm">
          <Text className="font-semibold text-green-800">
            Early Morning (6.00 – 7.30 AM)
          </Text>
          <Text className="text-gray-600 mt-2">• 1 glass warm water</Text>
          <Text className="text-gray-600">• 5–7 soaked black raisins</Text>
        </View>

        {/* Breakfast */}
        <View className="bg-white rounded-2xl p-4 mt-5 shadow-sm">
          <Text className="font-semibold text-green-800">
            Breakfast (8.00 – 9.00 AM)
          </Text>
          <Text className="text-gray-600 mt-2">Choose any one:</Text>
          <Text className="text-gray-600">• Oats / Dalia</Text>
          <Text className="text-gray-600">• 2 Roti + Boiled vegetables</Text>
          <Text className="text-gray-600">• Poha (without peanuts)</Text>

          <View className="bg-green-100 mt-3 p-3 rounded-xl">
            <Text className="text-red-500 font-semibold">Avoid:</Text>
            <Text className="text-gray-700">
              Bread, Biscuits, Sugar, Fast Food
            </Text>
          </View>
        </View>

        {/* Lunch */}
        <View className="bg-white rounded-2xl p-4 mt-5 shadow-sm">
          <Text className="font-semibold text-green-800">
            Lunch (1.00 – 2.00 PM)
          </Text>
          <Text className="text-gray-600 mt-2">
            • 2 Roti / Small rice portion
          </Text>
          <Text className="text-gray-600">
            • Vegetable (Lauki, Spinach, Bottle gourd)
          </Text>
          <Text className="text-gray-600">
            • Moong Dal
          </Text>

          <View className="bg-green-100 mt-3 p-3 rounded-xl">
            <Text className="text-red-500 font-semibold">Avoid:</Text>
            <Text className="text-gray-700">
              Meat, Biryani, Fast Food
            </Text>
          </View>
        </View>

        {/* WATER */}
        <View className="mt-8">
          <Text className="text-green-800 font-semibold text-lg">
            Water
          </Text>
          <Text className="text-gray-700 mt-2">
            Drink 2.5–3 liters daily (in small intervals).
          </Text>
        </View>

        {/* STRICTLY AVOID */}
        <View className="bg-red-100 p-4 rounded-2xl mt-8">
          <Text className="font-semibold text-red-600">
            Strictly Avoid for 30 Days
          </Text>
          <Text className="text-gray-700 mt-2">
            Sugar, Cold Drinks, Fried Foods, Bakery Items
          </Text>
        </View>

        {/* EXPECTED IMPROVEMENT */}
        <View className="bg-green-100 p-4 rounded-2xl mt-8">
          <Text className="font-semibold text-green-800">
            Expected Improvement Timeline
          </Text>
          <Text className="text-gray-700 mt-2">
            Within 15–20 days:
          </Text>
          <Text className="text-gray-600">
            • Weakness reduces
          </Text>
          <Text className="text-gray-600">
            • Dizziness decreases
          </Text>
          <Text className="text-gray-700 mt-3">
            Within 30 days:
          </Text>
          <Text className="text-gray-600">
            • Hemoglobin improves
          </Text>
          <Text className="text-gray-600">
            • Lipid profile stabilizes
          </Text>
        </View>
{/* ===== BOOSTER SECTION WRAPPER ===== */}
     <TouchableOpacity className="bg-green-600 mt-6 py-3 rounded-full items-center">
          <Text className="text-white font-semibold">
             Booster Plan (30 day)
          </Text>
        </TouchableOpacity>
<View className="bg-green-50 rounded-3xl mt-6 border border-green-200 overflow-hidden">

  {/* ===== Thyroid & Metabolic Support ===== */}
  <View className="p-5">
    <View className="flex-row items-start">
      
      <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
        <Text className="text-xl">🧠</Text>
      </View>

      <View className="flex-1">
        <Text className="text-green-900 font-bold text-base">
          Thyroid & Metabolic Support
        </Text>

        <Text className="text-green-800 mt-1 font-medium">
          Immune Booster
        </Text>

        <Text className="text-gray-600 mt-1 text-sm">
          Dosage: 1 tablet at night (after meals)
        </Text>

        <View className="mt-2">
          <Text className="text-gray-700 text-sm">
            • Helps improve T4 levels
          </Text>
          <Text className="text-gray-700 text-sm">
            • Supports thyroid regulation
          </Text>
          <Text className="text-gray-700 text-sm">
            • Improves metabolism
          </Text>
        </View>
      </View>
    </View>
  </View>

  <View className="border-t border-green-200" />

  {/* ===== Anemia & Bone Marrow Support ===== */}
  <View className="p-5">
    <View className="flex-row items-start">
      
      <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-4">
        <Text className="text-xl">🩸</Text>
      </View>

      <View className="flex-1">
        <Text className="text-green-900 font-bold text-base">
          Anemia & Bone Marrow Support
        </Text>

        <Text className="text-green-800 mt-1 font-medium">
          Bone Marrow Booster
        </Text>

        <Text className="text-gray-600 mt-1 text-sm">
          Dosage: 1 capsule morning
        </Text>

        <View className="mt-2">
          <Text className="text-gray-700 text-sm">
            • Helps increase hemoglobin (Hb)
          </Text>
          <Text className="text-gray-700 text-sm">
            • Improves RBC production
          </Text>
          <Text className="text-gray-700 text-sm">
            • Supports platelet stability
          </Text>
        </View>
      </View>
    </View>
  </View>

  <View className="border-t border-green-200" />

  {/* ===== Bone–Mineral Support ===== */}
  <View className="p-5">
    <View className="flex-row items-start">
      
      <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
        <Text className="text-xl">🦴</Text>
      </View>

      <View className="flex-1">
        <Text className="text-green-900 font-bold text-base">
          Bone–Mineral Support & ALP Control
        </Text>

        <Text className="text-green-800 mt-1 font-medium">
          Calcium + Mineral Booster
        </Text>

        <Text className="text-gray-600 mt-1 text-sm">
          Dosage: 1 tablet after lunch
        </Text>

        <View className="mt-2">
          <Text className="text-gray-700 text-sm">
            • Improves mineral absorption
          </Text>
          <Text className="text-gray-700 text-sm">
            • Strengthens bones and joints
          </Text>
          <Text className="text-gray-700 text-sm">
            • Reduces muscle weakness
          </Text>
        </View>
      </View>
    </View>
  </View>

  {/* ===== See All ===== */}
  <TouchableOpacity className="border-t border-green-200 py-3 items-center">
    <Text className="text-green-800 font-semibold">
      See all
    </Text>
  </TouchableOpacity>

</View>

        {/* ACCEPT */}
        <TouchableOpacity className="bg-green-700 mt-10 py-4 rounded-full items-center" onPress={() => router.push('/(tabs)/healthalert')}>
          <Text className="text-white font-bold text-lg">
            Accept
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
