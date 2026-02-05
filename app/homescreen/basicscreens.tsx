import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SvgHeader from '../../components/Clipperbg';
import BottomNav from '../../components/BottomNav';

import type { ComponentProps } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 220;
const logo = require('../../assets/images/medha_logo.png');

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type AssessmentCardProps = {
  icon: IoniconName;
  title: string;
  desc: string;
  onPress: () => void;
};

export default function HealthAssessmentIntro() {
  return (
    <View className="flex-1 bg-[#f5f6f8]">
      {/* ===== FIXED HEADER / APP BAR ===== */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            {/* LEFT + RIGHT ICONS */}
            <View className="absolute left-4 right-4 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
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

      {/* ===== SCROLL VIEW (SCROLLS UNDER HEADER) ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 220,
        }}
      >
        {/* Spacer = header height */}
        <View style={{ height: HEADER_HEIGHT }} />

        {/* Breadcrumb */}
        <Text className="text-gray-500 text-[14px] mb-1">
          ‹ Health Assessment
        </Text>

        {/* Title */}
        <Text className="text-[34px] font-bold text-[#0b4ea2]">
          Let's Get started
        </Text>

        <Text className="text-[16px] text-[#1f3c66] mt-2 mb-6">
          Please tell us a bit about yourself so we can guide
          your health journey.
        </Text>

        {/* Progress */}
        <View className="mb-8">
          <View className="h-3 bg-[#d6e6ff] rounded-full overflow-hidden">
            <View className="h-3 w-[50%] bg-[#0b4ea2] rounded-full" />
          </View>
          <Text className="text-[#0b4ea2] text-[14px] mt-2">
            Step 1 of 2
          </Text>
        </View>

        {/* Cards */}
        <AssessmentCard
          icon="person"
          title="Basic Health Assessment"
          desc="Know your Health abilities"
          onPress={() => router.push('/healthassessment')}
        />

        <AssessmentCard
          icon="heart"
          title="Daily Immunity Checkup"
          desc="Know your daily health reports"
          onPress={() => router.push('/immunity/dailyimmunity')}
        />

        <AssessmentCard
          icon="calendar"
          title="Weekly Immunity Checkup"
          desc="Know your weekly health reports"
          onPress={() => router.push('/immunity/weeklyimmunity')}
        />

        {/* Info */}
        <View className="bg-white rounded-[24px] p-4 mt-6">
          <Text className="text-center text-[14px] text-[#1f3c66] leading-6">
            All fields are optional, but more information means
            better care for you. Your details will remain
            confidential.
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity className="mt-5">
          <Text className="text-center text-[#0b4ea2] text-[15px]">
            Skip for now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 bg-[#1fa2ff] py-4 rounded-full flex-row items-center justify-center gap-2"
          onPress={() => router.push('/healthassessment')}
        >
          <Text className="text-white text-[18px] font-semibold">
            Next
          </Text>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0">
        <BottomNav />
      </View>
    </View>
  );
}

/* ================= CARD COMPONENT ================= */

function AssessmentCard({ icon, title, desc, onPress }: AssessmentCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} className="mb-4">
      <View
        className="bg-[#0b4ea2] px-4 py-5 flex-row items-center"
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 20,
        }}
      >
        <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-4">
          <Ionicons name={icon} size={22} color="#0b4ea2" />
        </View>

        <View className="flex-1">
          <Text className="text-white text-[18px] font-semibold">
            {title}
          </Text>
          <Text className="text-[#d6ecff] text-[14px] mt-1">
            {desc}
          </Text>
        </View>

        <View className="bg-white px-4 py-2 rounded-full">
          <Text className="text-[#0b4ea2] font-semibold text-[13px]">
            Get Started
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}