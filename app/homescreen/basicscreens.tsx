//updated

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import bg from '../../assets/images/headerbar.png';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type InfoCardProps = {
  icon: IoniconName;
  title: string;
  desc: string;
  route: string;
};

export default function BasicDetailsScreen() {
  return (
    <View className="flex-1 bg-[#f5f6f8]">
      <View className="h-[220px]">
        <ImageBackground source={bg} className="w-full h-[220px] justify-end" resizeMode="cover">
          <View className="flex-row items-center justify-between px-4 pb-5">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-[20px]">←</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="p-[30px] pb-[170px]">
            <Text className="text-[32px] font-bold text-[#0b4ea2] mt-4">
              Let’s Get started
            </Text>
            <Text className="text-[16px] text-[#1f3c66] mt-3.5 mb-5">
              Please tell us a bit about yourself so we can guide your health journey.
            </Text>

            <Text className="text-[14px] text-[#0b4ea2] mb-1.5">Step 1 of 2</Text>
            <View className="h-[6px] bg-[#d6e6ff] rounded-[3px] mb-6">
              <View className="w-1/2 h-[6px] bg-[#0b4ea2] rounded-[3px]" />
            </View>

            <InfoCard
              icon="person"
              title="Basic Details"
              desc="Know your Health abilities"
              route="/healthassessment"
            />

            <InfoCard
              icon="restaurant"
              title="Diet & Lifestyle"
              desc="Eating habits & daily activity"
              route="/dietscreen"
            />

            <InfoCard
              icon="nutrition"
              title="Your Food Preferences"
              desc="Vegetarian, non-vegetarian or mixed"
              route="/healthassessment/food-preferences"
            />

            <InfoCard
              icon="medkit"
              title="Medical History"
              desc="Existing medical conditions"
              route="/healthassessment/medical-history"
            />

            <Text className="text-center text-[13px] text-[#1f3c66] mt-5">
              All fields are optional, but more information means better care for you. Your details
              will remain confidential.
            </Text>

            <TouchableOpacity>
              <Text className="text-center text-[#0b4ea2] mt-2">Skip for now</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-5 flex-row self-center items-center bg-[#1fa2ff] px-10 py-[14px] rounded-[30px] gap-2">
              <Text className="text-white text-[16px] font-semibold">Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function InfoCard({ icon, title, desc, route }: InfoCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="flex-row items-center bg-[#0b4ea2] rounded-[26px] p-4 mb-[14px]"
      onPress={() => router.push(route)}
    >
      <View className="w-[44px] h-[44px] rounded-[22px] bg-white items-center justify-center mr-[14px]">
        <Ionicons name={icon} size={22} color="#0b4ea2" />
      </View>

      <View className="flex-1">
        <Text className="text-white text-[16px] font-semibold">{title}</Text>
        <Text className="text-[#d6ecff] text-[13px] mt-1">{desc}</Text>
      </View>

      <View className="bg-[#1fa2ff] px-[14px] py-[6px] rounded-[14px] ml-[10px]">
        <Text className="text-white text-[12px]">Know More</Text>
      </View>
    </TouchableOpacity>
  );
}
