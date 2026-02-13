import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SvgHeader from '../../components/Clipperbg';
import BottomNav from '../../components/BottomNav';
import { router } from 'expo-router';

export default function HealthAlertsScreen() {
  return (


    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
        <View className="absolute top-0 left-0 right-0 z-10 " >
              <SvgHeader />
      
              <SafeAreaView className="absolute top-0 w-full" >
                <View className="h-14 justify-center mt-4">
                  {/* LEFT + RIGHT ICONS */}
                  <View className="absolute left-4 right-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                    </TouchableOpacity>
      
                    <TouchableOpacity>
                      <Ionicons name="menu" size={26} color="#fff" />
                    </TouchableOpacity>
                  </View>
      
                  {/* CENTER LOGO */}
                  <View className="items-center">
                    {/* <Image
                      source={logo}
                      className="w-[150px] h-[100px]"
                      resizeMode="contain"
                    /> */}
                  </View>
                </View>
              </SafeAreaView>
            </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TITLE */}
        <View className="px-6 mt-56">
          <Text className="text-[#166534] text-[28px] font-bold text-center">
            Health Alerts
          </Text>
          <Text className="text-[#1f2937] text-center mt-2 text-[15px]">
            It’s time to take your boosters and drink water.
            Please update your status after doing so.
          </Text>
        </View>

        {/* NOTIFICATION TOGGLE */}
        <View className="flex-row justify-between items-center px-6 mt-6">
          <Text className="text-[#16a34a] text-[16px] font-semibold">
            Notification alerts enabled
          </Text>
          <Switch value={true} trackColor={{ true: "#22c55e" }} />
        </View>

        {/* MULTIVITAMIN – COMPLETED */}
        <LinearGradient
          colors={["#16a34a", "#15803d"]}
          className="mx-6 mt-6 rounded-[18px] p-5"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white p-3 rounded-xl mr-4">
                <Ionicons name="medkit" size={28} color="#2563eb" />
              </View>
              <View>
                <Text className="text-white text-[18px] font-bold">
                  Multivitamin
                </Text>
                <Text className="text-white text-[14px]">
                  8.00 A.M Booster
                </Text>
              </View>
            </View>
            <Text className="text-white text-[14px]">Completed</Text>
          </View>

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-white">
              Please take your multivitamin.
            </Text>
            <View className="bg-[#22c55e] px-4 py-1 rounded-full">
              <Text className="text-white font-semibold">✓ Taken</Text>
            </View>
          </View>
        </LinearGradient>

        {/* PROBIOTIC – MISSED */}
        <View className="mx-6 mt-5 bg-[#dcfce7] rounded-[18px] p-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white p-3 rounded-xl mr-4">
                <Ionicons name="shield-checkmark" size={28} color="#2563eb" />
              </View>
              <View>
                <Text className="text-[#166534] text-[18px] font-bold">
                  Probiotic
                </Text>
                <Text className="text-[#166534]">
                  8.30 A.M Supplement
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#166534" />
              <Text className="ml-1 text-[#166534]">Missed</Text>
            </View>
          </View>

          <Text className="text-[#166534] mt-3">
            Don’t forget your daily probiotic supplement.
          </Text>

          <View className="flex-row justify-between items-center mt-4">
            <TouchableOpacity className="bg-[#22c55e] px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">Take Now</Text>
            </TouchableOpacity>

            <View className="flex-row">
              {["+10", "+15", "+20", "+25"].map(t => (
                <View
                  key={t}
                  className="border border-[#22c55e] px-3 py-1 rounded-full ml-2"
                >
                  <Text className="text-[#16a34a]">{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* WATER REMINDER */}
        <View className="mx-6 mt-5 bg-[#dcfce7] rounded-[18px] p-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-white p-3 rounded-xl mr-4">
                <Ionicons name="water" size={28} color="#2563eb" />
              </View>
              <View>
                <Text className="text-[#166534] text-[18px] font-bold">
                  Water Reminder
                </Text>
                <Text className="text-[#166534]">
                  9.00 A.M Hydration
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#166534" />
              <Text className="ml-1 text-[#166534]">Missed</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-[#166534]">
              Drink a glass of water now.
            </Text>
            <View className="bg-[#bbf7d0] px-4 py-1 rounded-full">
              <Text className="text-[#166534]">Missed</Text>
            </View>
          </View>
        </View>

        {/* EXERCISE SUGGESTIONS */}
        <LinearGradient
          colors={["#16a34a", "#15803d"]}
          className="mx-6 mt-6 rounded-[18px] p-5"
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="fitness" size={22} color="#fff" />
            <Text className="text-white text-[18px] font-bold ml-2">
              Quick suggestions for exercise
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-white">• 20 minutes a day</Text>
              <Text className="text-white">• Cycling (15min)</Text>
              <Text className="text-white">• Just staying active</Text>
            </View>
            <View>
              <Text className="text-white">• Jogging (15min)</Text>
              <Text className="text-white">• Swimming (15min)</Text>
              <Text className="text-white">• Jump rope (10min)</Text>
            </View>
          </View>

          <Text className="text-white mt-3 font-semibold">
            * You need to do all of this for 1.5 hrs
          </Text>
        </LinearGradient>

        {/* FOOTER */}
        <View className="px-6 mt-8 mb-28">
          <Text className="text-center text-[#1f2937]">
            Your progress is saved for the Reports.
          </Text>
          <Text className="text-center text-[#1f2937] mt-2">
            Reports are kept confidential, securely stored, and used only for
            your health guidance.
          </Text>
        </View>
      </ScrollView>
        <View className="absolute bottom-0 left-0 right-0">
              <BottomNav />
            </View>
    </SafeAreaView>
  );
}
