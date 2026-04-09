import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SvgHeader from '../components/Clipperbg';
import HeaderBackButton from '../components/HeaderBackButton';
import { goBackOrReplace } from '../services/navigation';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 155; // 👈 must match SvgHeader height

export default function HealthAssessmentScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* 🔹 SVG HEADER (ABSOLUTE) */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full px-4">
          <View className="mt-4 flex-row items-center justify-between">
            <HeaderBackButton
              onPress={() => goBackOrReplace('/(tabs)/dashboard')}
            />
          </View>
        </SafeAreaView>
      </View>

      {/* 🔹 CONTENT */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: HEADER_HEIGHT + 30, // 👈 push content below header
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* TITLE */}
          <Text className="text-[30px] font-extrabold text-[#0b4ea2]">
            Health Assessment
          </Text>
          <Text className="text-[16px] text-[#1f3c66] mt-1.5 mb-6">
            Answer a few questions to get your personalized health insights.
          </Text>

          {/* PROGRESS */}
          <View className="flex-row items-center gap-2.5 mb-6">
            <View className="flex-1 h-[6px] bg-[#d6e6ff] rounded-[3px]">
              <View
                className="h-[6px] bg-[#0b4ea2] rounded-[3px]"
                style={{ width: '0%' }}
              />
            </View>
            <Text className="text-[14px] font-bold text-[#0b4ea2]">0%</Text>
          </View>

          {/* INFO CARD */}
          <View className="bg-[#0b4ea2] rounded-[24px] p-5 mb-[30px]">
            <Text className="text-white text-[20px] font-bold mb-3">
              Before You Start
            </Text>

            <View className="flex-row gap-1.5 mb-2">
              <Text className="text-white text-[18px]">•</Text>
              <Text className="text-[#e6f1ff] text-[14px] flex-1">
                This assessment will take approximately 5–7 minutes.
              </Text>
            </View>

            <View className="flex-row gap-1.5 mb-2">
              <Text className="text-white text-[18px]">•</Text>
              <Text className="text-[#e6f1ff] text-[14px] flex-1">
                Answer honestly for the most accurate health guidance.
              </Text>
            </View>

            <View className="flex-row gap-1.5 mb-2">
              <Text className="text-white text-[18px]">•</Text>
              <Text className="text-[#e6f1ff] text-[14px] flex-1">
                Your responses are private and securely stored.
              </Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-[#1fa2ff] py-4 rounded-[30px] gap-2"
            onPress={() => router.push('/process')}
          >
            <Text className="text-white text-[16px] font-bold">
              Start Health Assessment
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <Text className="text-center text-[13px] text-[#1f3c66] mt-3">
            You can pause and resume anytime
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
