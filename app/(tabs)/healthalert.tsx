import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import SvgHeader from "../../components/Clipperbg";

type MealCardProps = {
  title: "Breakfast" | "Lunch" | "Dinner";
  time: string;
  status: string;
  note: string;
  completed?: boolean;
};

// Foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HealthAlertsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // Android channel is recommended for proper behavior/sound
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("health-reminders", {
          name: "Health Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      const settings = await Notifications.getPermissionsAsync();
      let finalStatus = settings.status;

      if (finalStatus !== "granted") {
        const request = await Notifications.requestPermissionsAsync();
        finalStatus = request.status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow notifications to use alarms and reminders."
        );
      }
    } catch (error) {
      console.log("Notification setup error:", error);
    }
  };

  const cancelAllAlarms = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert("Cancelled", "All scheduled reminders have been removed.");
    } catch (error) {
      console.log("Cancel error:", error);
    }
  };

  // Daily recurring reminder using calendar/date matching trigger
  const scheduleDailyMealAlarm = async (
    meal: string,
    hour: number,
    minute: number
  ) => {
    try {
      if (!notificationsEnabled) {
        Alert.alert("Disabled", "Enable notifications first.");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Health Booster Reminder",
          body: `Time for ${meal}. Please take your booster.`,
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: Platform.OS === "android" ? "health-reminders" : undefined,
        },
      });

      Alert.alert("Alarm set", `${meal} reminder scheduled successfully.`);
    } catch (error) {
      console.log("Meal alarm error:", error);
      Alert.alert("Error", `Could not schedule ${meal} reminder.`);
    }
  };

  // Hourly repeating water reminder
  const scheduleWaterAlarm = async () => {
    try {
      if (!notificationsEnabled) {
        Alert.alert("Disabled", "Enable notifications first.");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hydration Reminder",
          body: "Please drink water to stay hydrated.",
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * 60,
          repeats: true,
          channelId: Platform.OS === "android" ? "health-reminders" : undefined,
        },
      });

      Alert.alert("Water alarm set", "You will receive reminders every hour.");
    } catch (error) {
      console.log("Water alarm error:", error);
      Alert.alert("Error", "Could not schedule water reminder.");
    }
  };

  const MealCard = ({
    title,
    time,
    status,
    note,
    completed = false,
  }: MealCardProps) => {
    const handleSetAlarm = () => {
      if (title === "Breakfast") {
        scheduleDailyMealAlarm("Breakfast", 8, 0);
      } else if (title === "Lunch") {
        scheduleDailyMealAlarm("Lunch", 13, 0);
      } else if (title === "Dinner") {
        scheduleDailyMealAlarm("Dinner", 21, 0);
      }
    };

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

        <TouchableOpacity
          className="bg-green-500 mt-4 py-2 rounded-full items-center"
          onPress={handleSetAlarm}
        >
          <Text className="text-white font-semibold">Set Alarm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 150, paddingBottom: 220 }}
      >
        <Text className="text-3xl font-bold text-green-700 text-center">
          Health Alerts
        </Text>

        <Text className="text-center text-gray-700 mt-3">
          It&apos;s time to take your boosters and drink water.
          {"\n"}Please update your status after doing so.
        </Text>

        <View className="flex-row justify-between items-center mt-6">
          <Text className="text-green-700 text-lg font-semibold">
            Notification alerts enabled
          </Text>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#ccc", true: "#16a34a" }}
            thumbColor="#fff"
          />
        </View>

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
            time="1:00 - 1:30 P.M"
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

        <View className="bg-green-100 rounded-2xl p-5 mt-3 mb-8">
          <Text className="text-2xl font-bold">Water Reminder</Text>

          <Text className="mt-2 text-lg">1290 ml/day</Text>
          <Text className="text-gray-700">1110 ml remaining</Text>

          <TouchableOpacity
            className="bg-green-500 py-2 rounded-full mt-4 items-center"
            onPress={scheduleWaterAlarm}
          >
            <Text className="text-white font-semibold">Start Water Alarm</Text>
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

        <TouchableOpacity
          className="bg-red-500 py-3 rounded-full items-center mb-6"
          onPress={cancelAllAlarms}
        >
          <Text className="text-white font-semibold">Cancel All Alarms</Text>
        </TouchableOpacity>

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
