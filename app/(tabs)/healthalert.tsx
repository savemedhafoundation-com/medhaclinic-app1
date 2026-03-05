import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgHeader from "../../components/Clipperbg";

export default function HealthAlertsScreen() {
  const [notifications, setNotifications] = useState(true);

  const MealCard = ({
    title,
    time,
    status,
    note,
    completed = false,
  }) => {
    return (
      <View
        className={`rounded-2xl p-5 mb-5 ${
          completed ? "bg-green-600" : "bg-green-100"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text
              className={`text-xl font-bold ${
                completed ? "text-white" : "text-black"
              }`}
            >
              {title}
            </Text>
            <Text
              className={`mt-1 ${
                completed ? "text-white" : "text-gray-800"
              }`}
            >
              {time}
            </Text>
          </View>

          <Text
            className={`font-semibold ${
              completed ? "text-white" : "text-gray-700"
            }`}
          >
            {status}
          </Text>
        </View>

        <Text
          className={`mt-4 ${
            completed ? "text-white" : "text-gray-700"
          }`}
        >
          {note}
        </Text>

        <View className="flex-row justify-end mt-4 space-x-3">
          <TouchableOpacity className="bg-green-300 px-4 py-2 rounded-full">
            <Text>No</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-full">
            <Text className="text-white">Yes</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-green-500 mt-4 py-2 rounded-full items-center">
          <Text className="text-white font-semibold">Set Timer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 150, paddingBottom: 220 }}
      >
        {/* Title */}
        <Text className="text-3xl font-bold text-green-700 text-center">
          Health Alerts
        </Text>

        <Text className="text-center text-gray-700 mt-3">
          It’s time to take your boosters and drink water.
          {"\n"}Please update your status after doing so.
        </Text>

        {/* Toggle */}
        <View className="flex-row justify-between items-center mt-6">
          <Text className="text-green-700 text-lg font-semibold">
            Notification alerts enabled
          </Text>

          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ccc", true: "#16a34a" }}
            thumbColor="#fff"
          />
        </View>

        {/* Meals */}
        <View className="mt-6">
          <MealCard
            title="Breakfast"
            time="8:00 A.M"
            status="Completed"
            note="*Please take your morning booster"
            completed
          />

          <MealCard
            title="Lunch"
            time="1:00 – 1:30 P.M"
            status="Upcoming"
            note="*Please take your lunch booster"
          />

          <MealCard
            title="Dinner"
            time="9:00 P.M"
            status="Upcoming"
            note="*Please take your dinner booster"
          />
        </View>

        {/* Water Reminder */}
        <View className="bg-green-100 rounded-2xl p-5 mt-3 mb-8">
          <Text className="text-2xl font-bold">Water Reminder</Text>

          <Text className="mt-2 text-lg">1290 ml/day</Text>
          <Text className="text-gray-700">1110 ml remaining</Text>

          <TouchableOpacity className="bg-green-500 py-2 rounded-full mt-4 items-center">
            <Text className="text-white font-semibold">Set Goal</Text>
          </TouchableOpacity>

          <View className="flex-row justify-between mt-5">
            {["180 ml", "250 ml", "350 ml", "500 ml"].map((item) => (
              <TouchableOpacity
                key={item}
                className="bg-green-400 px-4 py-2 rounded-full"
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="text-center text-gray-800 mb-3">
          Your progress is saved for the Reports.
        </Text>

        <Text className="text-center text-gray-700 mb-16">
          Reports are kept confidential, securely stored,
          {"\n"}and used only for your health guidance.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}