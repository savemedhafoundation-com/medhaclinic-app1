import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

import BottomNav from '../../components/BottomNav';

import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🔹 ASSETS
import bg from '../../assets/images/common_bgpage.png';
import logo from '../../assets/images/medha_logo.png';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type ActionCardProps = {
  icon: IoniconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

type HelpCardProps = {
  icon: IoniconName;
  title: string;
};

type DisclaimerItemProps = {
  text: string;
};

export default function InformationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0B3A6E]">
      <ImageBackground source={bg} className="flex-1" resizeMode="cover">
        {/* ================= MAIN CONTENT ================= */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-5 pb-[60px]">
            {/* ================= HEADER ================= */}
            <View className="flex-row justify-between items-center mb-[76px] mt-[70px] relative">
              <View className="absolute left-0 right-0 items-center">
                <Image source={logo} className="w-[254px] h-[254px]" resizeMode="contain" />
              </View>
            </View>

            {/* ================= TITLE ================= */}
            <Text className="text-[30px] text-white font-bold mb-3">
              Welcome to{`\n`}Medha Clinic
            </Text>

            <Text className="text-[#E0F2FE] text-[14px] mb-[18px]">
              We are here to understand your body and guide recovery naturally.
            </Text>

            <Text className="text-white text-[16px] font-semibold mb-4">
              What would you like to do today?
            </Text>

            {/* ================= ACTION CARDS ================= */}
            <ActionCard
              icon="stats-chart-outline"
              title="Start Health Assessment"
              subtitle="Tell us about your body, lifestyle, and how you're feeling."
              onPress={() => router.push('/homescreen/basicscreens')}
            />

            <ActionCard
              icon="cloud-upload-outline"
              title="Upload Medical Reports"
              subtitle="PDF, Image, or Photo. You may continue without reports."
            />

            <ActionCard
              icon="leaf-outline"
              title="I Want to Understand Natural Immunotherapy"
              subtitle="Learn how healing through natural immunity works."
            />

            {/* ================= HOW HELPS ================= */}
            <Text className="text-white text-[18px] font-bold my-[18px]">
              How Medha Clinic Helps :
            </Text>

            <View className="flex-row justify-between">
              <HelpCard
                icon="pulse-outline"
                title="Understand What’s Happening Inside Your Body"
              />
              <HelpCard
                icon="nutrition-outline"
                title="Personalized Diet & Nutrition Guidance"
              />
            </View>

            {/* ================= DISCLAIMER ================= */}
            <View className="bg-[rgba(0,0,0,0.25)] rounded-[18px] p-4 mt-[22px]">
              <Text className="text-white font-bold mb-3">
                What This App Does NOT Do
              </Text>

              <View className="flex-row justify-between">
                <DisclaimerItem text="Replace emergency treatment" />
                <DisclaimerItem text="Promise instant cure" />
              </View>

              <View className="flex-row justify-between">
                <DisclaimerItem text="Use fear-based language" />
                <DisclaimerItem text="Fake promises" />
              </View>
            </View>

            {/* ================= START BUTTON ================= */}
            <View className="mt-[30px] items-center">
              <Text className="text-center text-[#E0F2FE]">
                Begin by telling us about your body.
              </Text>

              <TouchableOpacity
                className="flex-row items-center bg-[#29B6F6] px-[42px] py-[14px] rounded-[30px] mt-[14px]"
                activeOpacity={0.85}
                style={{
                  shadowColor: '#29B6F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-[16px] font-semibold mr-[6px]">
                  Start
                </Text>
                <Ionicons name="arrow-forward-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 🔴 IMPORTANT SPACE so BottomNav doesn't overlap */}
            <View className="h-[120px]" />
          </View>
        </ScrollView>

        {/* ================= BOTTOM NAV ================= */}
        <BottomNav />
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ================= SUB COMPONENTS ================= */

function ActionCard({ icon, title, subtitle, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-[#1E88E5] rounded-[24px] p-4 mb-[14px]"
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Ionicons name={icon} size={26} color="#FFFFFF" />
      <View className="flex-1 ml-[14px]">
        <Text className="text-white text-[16px] font-semibold">{title}</Text>
        <Text className="text-[#D0E8FF] text-[12px] mt-1">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function HelpCard({ icon, title }: HelpCardProps) {
  return (
    <View className="bg-[#1976D2] rounded-[20px] p-4 w-[48%]">
      <Ionicons name={icon} size={28} color="#FFFFFF" />
      <Text className="text-white font-semibold text-[13px] mt-2">{title}</Text>
    </View>
  );
}

function DisclaimerItem({ text }: DisclaimerItemProps) {
  return (
    <View className="flex-row items-center w-[48%] mb-[18px]">
      <Ionicons name="close-circle" size={16} color="#FF5252" />
      <Text className="text-[#E5F0FF] text-[12px] ml-1.5">{text}</Text>
    </View>
  );
}
