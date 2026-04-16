import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { goBackOrReplace } from "../services/navigation";
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from "../components/ScreenNav";

export default function AdviceScreen() {
  return (
    <View className="flex-1 bg-gray-100">

      {/* ===== HEADER ===== */}
      <ScreenNav onBackPress={() => goBackOrReplace("/certification/daily")} />

      {/* ===== CONTENT ===== */}
      <ScrollView
        className="flex-1 px-6"
  contentContainerStyle={{
    paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
    paddingBottom: 140,
  }}
      >
        {/* Illustration */}
<View style={{ marginTop: 20, alignItems: "center" }}>
  <Image
    source={require("../assets/images/models/adviceimg.png")}
    style={{ width: 300, height: 250 }}
    resizeMode="contain"
  />
</View>

        {/* Title */}
        <Text className="text-center text-3xl font-bold text-green-700 mt-6">
          Advice
        </Text>

        {/* Description */}
        <Text className="text-center text-gray-700 text-lg mt-4 leading-7">
          Get expert guidance tailored to your health needs. Our specialists
          provide personalized recommendations diets, lifestyle tips, and
          boosters to support your recovery and overall well-being.
        </Text>

        {/* ===== ACTION CARDS ===== */}
        <View className="mt-10 space-y-6">

          {/* Card 1 */}
          <TouchableOpacity className="bg-green-600 rounded-2xl p-5 flex-row items-center justify-between "  onPress={() => router.push("/dietscreen")}
>
            <View className="flex-row items-center">
              <View className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="restaurant" size={22} color="green" />
              </View>

              <View>
                <Text className="text-white text-lg font-semibold">
                  Personalized Health Diet
                </Text>
                <Text className="text-green-100 mt-1">
                  Guidance tailored for you
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            className="bg-green-600 rounded-2xl p-5 flex-row items-center justify-between mt-10"
            onPress={() => router.push('/boosterdiet/boosters')}
          >
            <View className="flex-row items-center">
              <View className="bg-white w-12 h-12 rounded-full items-center justify-center mr-4">
                <Ionicons name="flask" size={22} color="green" />
              </View>

              <View>
                <Text className="text-white text-lg font-semibold">
                  Get your Boosters
                </Text>
                <Text className="text-green-100 mt-1">
                  Extra support for better health
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={26} color="#fff" />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ===== BOTTOM NAV ===== */}
 

    </View>
  );
}
