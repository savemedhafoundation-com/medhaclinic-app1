import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SvgHeader from '../../components/Clipperbg';
import BottomNav from '../../components/BottomNav';

export default function DietPlanScreen() {
  return (
    <View className="flex-1 bg-gray-100">
    <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
      </View>
      {/* ================= MAIN SCROLL ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 170,paddingTop: 180 }}
      >

        {/* ================= HERO IMAGE ================= */}
        <View className="items-center">
          <Image
            source={require("../../assets/images/dietheader.png")}
            className="w-full h-64"
            resizeMode="contain"
          />
        </View>

        {/* ================= TITLE ================= */}
        <View className="px-5 mt-2">
          <Text className="text-green-700 text-xl font-bold">
            30- Day Boosters & Diet Plan ✓
          </Text>

          <Text className="mt-3 text-gray-700 leading-6">
            A special 30-day booster & dietplan designed to support thyroid,
            immunity, anemia, bone strength, liver metabolism, and overall
            well-being
          </Text>
        </View>

        {/* ================= BUTTON ================= */}
        <View className="px-5 mt-6">
          <Pressable className="bg-green-600 py-4 rounded-full items-center">
            <Text className="text-white text-lg font-semibold">
              Part-2: Diet Plan (30 day)
            </Text>
          </Pressable>

          <Text className="mt-4 text-red-600 font-semibold">
            Very Important
            <Text className="text-black font-normal">
              {" "}– Without proper diet, Hb and cholesterol will not improve
            </Text>
          </Text>
        </View>

        {/* ================= EARLY MORNING ================= */}
        <View className="px-5 mt-6">
          <View className="bg-green-50 border border-green-200 p-5 rounded-2xl">
            <Text className="font-bold text-lg">
              Early Morning (6.00 – 7.30 AM)
            </Text>
            <Text className="mt-2 text-gray-700">
              1 glass of warm water
            </Text>
            <Text className="text-gray-700">
              5–7 soaked black raisins
            </Text>
          </View>
        </View>

        {/* ================= BREAKFAST ================= */}
        <View className="px-5 mt-6">
          <View className="bg-white border border-gray-200 p-5 rounded-2xl">
            <Text className="font-bold text-lg">
              Breakfast (8.00 – 9.00 AM)
            </Text>

            <Text className="mt-3 font-semibold">Choose any one</Text>
            <Text className="mt-2">• Oats / Dalia (broken wheat)</Text>
            <Text>• 2 rotis + boiled vegetables</Text>
            <Text>• Poha (without peanuts)</Text>

            <View className="bg-green-100 mt-4 p-4 rounded-xl">
              <Text className="text-red-600 font-semibold mb-2">
                ❌ Avoid:
              </Text>
              <Text>• Bread</Text>
              <Text>• Biscuits</Text>
              <Text>• Sugar</Text>
              <Text>• Fast Food</Text>
            </View>
          </View>
        </View>

        {/* ================= LUNCH ================= */}
        <View className="px-5 mt-6">
          <View className="bg-white border border-gray-200 p-5 rounded-2xl">
            <Text className="font-bold text-lg">
              Lunch (1.00 – 2.00 PM)
            </Text>

            <Text className="mt-3">
              • 2 rotis / small portion of rice
            </Text>
            <Text>
              • Vegetables (lauki, patol, pumpkin, spinach)
            </Text>
            <Text>• Dal (lentils)</Text>
            <Text>
              • Fish 2–3 days per week (not fried)
            </Text>

            <View className="bg-green-100 mt-4 p-4 rounded-xl">
              <Text className="text-red-600 font-semibold mb-2">
                ❌ Avoid:
              </Text>
              <Text>• Meat</Text>
              <Text>• Biryani</Text>
              <Text>• Fast Food</Text>
            </View>
          </View>
        </View>

        {/* ================= WATER ================= */}
        <View className="px-5 mt-6">
          <View className="bg-white border border-gray-200 p-5 rounded-2xl">
            <Text className="font-bold text-lg">Water</Text>
            <Text className="mt-2">
              Drink 2.5 – 3 liters daily in small amounts
            </Text>
          </View>
        </View>

        {/* ================= STRICTLY AVOID ================= */}
        <View className="px-5 mt-6">
          <Text className="font-bold text-lg mb-3">
            Strictly Avoid for 30 Days
          </Text>

          <View className="bg-green-100 p-5 rounded-2xl">
            <Text>❌ Sugar</Text>
            <Text>❌ Sweets</Text>
            <Text>❌ Cold drinks</Text>
            <Text>❌ Bakery items</Text>
            <Text>❌ Fried foods</Text>
          </View>
        </View>

        {/* ================= IMPROVEMENT ================= */}
        <View className="px-5 mt-6">
          <Text className="font-bold text-lg mb-3">
            Expected Improvement Timeline
          </Text>

          <View className="bg-green-100 p-5 rounded-2xl">
            <Text className="font-semibold">
              Within 15–20 Days
            </Text>
            <Text>• Weakness will reduce</Text>
            <Text>• Dizziness will decrease</Text>

            <Text className="font-semibold mt-4">
              Within 30 Days
            </Text>
            <Text>• Hemoglobin will improve</Text>
            <Text>• Cholesterol will reduce</Text>
            <Text>• ALP will gradually normalize</Text>
            <Text>• Thyroid hormone activity improves</Text>
          </View>
        </View>

        {/* ================= REPEAT TEST ================= */}
        <View className="px-5 mt-6">
          <Text className="font-bold text-lg mb-3">
            Repeat Tests After 30–45 Days
          </Text>

          <View className="bg-green-100 p-4 rounded-full items-center">
            <Text>TSH, FT4 • CBC • Lipid Profile • ALP</Text>
          </View>
        </View>

        {/* ================= CONTACT ================= */}
        <View className="bg-green-200 mt-8 p-6">
          <Text className="font-bold text-lg mb-3">
            Availability & Contact
          </Text>

          <Text className="mb-4">
            All boosters available from Dantura Botanics.
          </Text>

          <Pressable className="bg-white py-3 rounded-full items-center mb-4">
            <Text className="text-green-700 font-semibold">
              Visit Dantura Botanics →
            </Text>
          </Pressable>

          <Text>📞 +91 9800808595</Text>
          <Text>📱 WhatsApp: +91 9800808595</Text>
        </View>

      </ScrollView>
<BottomNav />
      {/* ================= FIXED BOTTOM NAV ================= */}
      {/* <View className="absolute bottom-0 left-0 right-0 bg-green-700 py-4 flex-row justify-around items-center">
        <Ionicons name="home" size={26} color="white" />
        <Ionicons name="stats-chart" size={26} color="white" />
        <Ionicons name="person" size={26} color="white" />
      </View> */}

    </View>
  );
}
