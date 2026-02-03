import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
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

export default function DietLifestyleScreen() {
  const [eating, setEating] = useState('Moderate');
  const [meals, setMeals] = useState('2');
  const [activity, setActivity] = useState('Very active');

  return (
    <ImageBackground source={bg} className="flex-1" resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,120,255,0.9)', 'rgba(255,255,255,0.95)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
          >
            {/* ===== HEADER ===== */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>

              <Image
                source={logo}
                className="w-[180px] h-[60px]"
                resizeMode="contain"
              />
            </View>

            {/* ===== TITLE + SUBTITLE (REORDERED) ===== */}
            <Text className="mt-4 mb-5">
              <Text className="text-[28px] font-bold text-[#0b4ea2]">
                Diet & Lifestyle{'\n'}
              </Text>
              <Text className="text-[16px] text-[#1f3c66]">
                Tell us about your eating habits and lifestyle
              </Text>
            </Text>

            {/* ===== EATING HABITS CARD ===== */}
            <View className="bg-white rounded-[22px] p-4 mb-5">
              <Text className="mb-3">
                <Text className="text-[18px] font-bold text-[#0b4ea2]">
                  Eating Habits{'\n'}
                </Text>
                <Text className="text-[14px] text-[#1f3c66]">
                  How would you describe your eating habits?
                </Text>
              </Text>

              <View className="flex-row gap-2.5 mb-4">
                {['Very Healthy', 'Moderate', 'Not Healthy'].map(item => (
                  <SelectCard
                    key={item}
                    text={item}
                    active={eating === item}
                    onPress={() => setEating(item)}
                  />
                ))}
              </View>

              <Text className="mb-3">
                <Text className="text-[14px] text-[#1f3c66]">
                  How many meals do you eat per day?
                </Text>
              </Text>

              <View className="flex-row gap-2.5">
                {['1', '2', '3', '4+'].map(item => (
                  <Pill
                    key={item}
                    text={item}
                    active={meals === item}
                    onPress={() => setMeals(item)}
                  />
                ))}
              </View>
            </View>

            {/* ===== ACTIVITY CARD ===== */}
            <View className="bg-white rounded-[22px] p-4 mb-5">
              <Text className="mb-3">
                <Text className="text-[18px] font-bold text-[#0b4ea2]">
                  Daily Activity{'\n'}
                </Text>
                <Text className="text-[14px] text-[#1f3c66]">
                  How active are you during the day?
                </Text>
              </Text>

              <View className="flex-row flex-wrap gap-3">
                {[
                  'Sedentary',
                  'Lightly active',
                  'Moderately',
                  'Very active',
                ].map(item => (
                  <ActivityBtn
                    key={item}
                    text={item}
                    active={activity === item}
                    onPress={() => setActivity(item)}
                  />
                ))}
              </View>
            </View>

            {/* ===== CTA ===== */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#1fa2ff] py-3.5 rounded-[30px] gap-1.5 mt-2.5"
              onPress={() => router.push('/foodpreferance')}
            >
              <Text className="text-white text-[16px] font-semibold">
                Next Step
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            {/* ===== FOOTER NOTE ===== */}
            <Text className="text-center text-[12px] text-[#1f3c66] mt-3">
              Your body's needs are unique.{'\n'}
              This helps us know you better.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

/* ================= COMPONENTS ================= */

type OptionButtonProps = {
  text: string;
  active: boolean;
  onPress: () => void;
};

function SelectCard({ text, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-1 py-[18px] rounded-[14px] items-center ${
        active ? 'bg-[#1fa2ff]' : 'bg-[#eef5ff]'
      }`}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className={`text-[13px] font-semibold ${
          active ? 'text-white' : 'text-[#0b4ea2]'
        }`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function Pill({ text, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-[20px] ${
        active ? 'bg-[#1fa2ff]' : 'bg-[#eef5ff]'
      }`}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className={`font-semibold ${
          active ? 'text-white' : 'text-[#0b4ea2]'
        }`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function ActivityBtn({ text, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      className={`w-[48%] py-3.5 rounded-[22px] items-center ${
        active ? 'bg-[#1fa2ff]' : 'bg-[#eef5ff]'
      }`}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className={`text-[14px] font-semibold ${
          active ? 'text-white' : 'text-[#0b4ea2]'
        }`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
