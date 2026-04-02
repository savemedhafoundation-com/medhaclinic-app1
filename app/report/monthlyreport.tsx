import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { goBackOrReplace } from '../../services/navigation';

export default function MonthlyReportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#f4fbf3]">
      <View className="flex-1 px-6 py-6">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => goBackOrReplace('/(tabs)/dashboard')}
          className="mb-8 h-11 w-11 items-center justify-center rounded-full bg-[#166534]">
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7]">
            <Ionicons name="calendar-outline" size={36} color="#166534" />
          </View>

          <Text className="text-center text-[30px] font-extrabold text-[#14532d]">
            Monthly Report
          </Text>

          <Text className="mt-3 max-w-[280px] text-center text-[15px] leading-6 text-[#4b6352]">
            This screen is ready as a valid Expo Router route. You can plug in the full
            monthly report experience here next.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/report/weeklyreport')}
            className="mt-8 rounded-full bg-[#16a34a] px-6 py-4">
            <Text className="text-[15px] font-bold text-white">Open Weekly Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
