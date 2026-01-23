import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bg from '../assets/images/diet_lifestyle_bg.png';
import logo from '../assets/images/medha_logo.png';

export default function HealthAssessmentScreen() {
  return (
    <ImageBackground source={bg} className="flex-1" resizeMode="none">
      {/* <LinearGradient
        colors={['rgba(0,120,255,95)', 'rgba(225,225,255,50)']}
        style={{ flex: 1 }}
      > */}
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
          <View className="flex-row items-center">
  {/* LEFT – Back button */}
  <TouchableOpacity
    className="w-10 items-center"
    onPress={() => router.back()}
  >
    <Ionicons name="chevron-back" size={28} color="#fff" />
  </TouchableOpacity>

  {/* CENTER – Logo */}
  <View className="flex-1 items-center">
    <Image source={logo} className="w-[180px] h-[60px]" resizeMode="contain" />
  </View>

  {/* RIGHT – Spacer (balances back button) */}
  <View className="w-10 items-center" />
</View>

            {/* TITLE */}
            <Text className="text-[30px] font-extrabold text-[#0b4ea2] mt-[130px]">Health Assessment</Text>
            <Text className="text-[16px] text-[#1f3c66] mt-1.5 mb-6">
              Answer a few questions to get your personalized health insights.
            </Text>

            {/* PROGRESS */}
            <View className="flex-row items-center gap-2.5 mb-6">
              <View className="flex-1 h-[6px] bg-[#d6e6ff] rounded-[3px]">
                <View className="h-[6px] bg-[#0b4ea2] rounded-[3px]" style={{ width: '0%' }} />
              </View>
              <Text className="text-[14px] font-bold text-[#0b4ea2]">0%</Text>
            </View>

            {/* INFO CARD */}
            <View className="bg-[#0b4ea2] rounded-[24px] p-5 mb-[30px]">
              <Text className="text-white text-[20px] font-bold mb-3">Before You Start</Text>

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
            //   onPress={() => router.push('/assessment/step-1')}
            >
              <Text className="text-white text-[16px] font-bold">Start Health Assessment</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <Text className="text-center text-[13px] text-[#1f3c66] mt-3">
              You can pause and resume anytime
            </Text>
          </ScrollView>
        </SafeAreaView>
      {/* </LinearGradient> */}
    </ImageBackground>
  );
}




