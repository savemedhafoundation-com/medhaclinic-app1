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

import bg from '../assets/images/dashbg.png';
import logo from '../assets/images/medha_logo.png';
import { goBackOrReplace } from '../services/navigation';

const COLORS = {
  accent: '#16a34a',
  accentDark: '#176E18',
  accentMuted: '#4F7653',
  accentSoft: '#E7F8DD',
  card: '#FFFFFF',
};

export default function DietLifestyleScreen() {
  const [eating, setEating] = useState('Moderate');
  const [meals, setMeals] = useState('2');
  const [activity, setActivity] = useState('Very active');

  return (
    <ImageBackground source={bg} className="flex-1" resizeMode="cover">
      <LinearGradient
        colors={['rgba(24,184,3,0.94)', 'rgba(247,255,242,0.98)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
          >
            {/* ===== HEADER ===== */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => goBackOrReplace('/(tabs)/dashboard')}>
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
              <Text
                className="text-[28px] font-bold"
                style={{ color: COLORS.accentDark }}
              >
                Diet & Lifestyle{'\n'}
              </Text>
              <Text
                className="text-[16px]"
                style={{ color: COLORS.accentMuted }}
              >
                Tell us about your eating habits and lifestyle
              </Text>
            </Text>

            {/* ===== EATING HABITS CARD ===== */}
            <View
              className="rounded-[22px] p-4 mb-5"
              style={{ backgroundColor: COLORS.card }}
            >
              <Text className="mb-3">
                <Text
                  className="text-[18px] font-bold"
                  style={{ color: COLORS.accentDark }}
                >
                  Eating Habits{'\n'}
                </Text>
                <Text
                  className="text-[14px]"
                  style={{ color: COLORS.accentMuted }}
                >
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
                <Text
                  className="text-[14px]"
                  style={{ color: COLORS.accentMuted }}
                >
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
            <View
              className="rounded-[22px] p-4 mb-5"
              style={{ backgroundColor: COLORS.card }}
            >
              <Text className="mb-3">
                <Text
                  className="text-[18px] font-bold"
                  style={{ color: COLORS.accentDark }}
                >
                  Daily Activity{'\n'}
                </Text>
                <Text
                  className="text-[14px]"
                  style={{ color: COLORS.accentMuted }}
                >
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
              className="flex-row items-center justify-center py-3.5 rounded-[30px] gap-1.5 mt-2.5"
              style={{ backgroundColor: COLORS.accent }}
              onPress={() =>
                router.push(
                  `/foodpreferance?eatingHabits=${encodeURIComponent(eating)}&mealsPerDay=${encodeURIComponent(meals)}&activityLevel=${encodeURIComponent(activity)}`
                )
              }
            >
              <Text className="text-white text-[16px] font-semibold">
                Next Step
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            {/* ===== FOOTER NOTE ===== */}
            <Text
              className="text-center text-[12px] mt-3"
              style={{ color: COLORS.accentMuted }}
            >
              Your body&apos;s needs are unique.{'\n'}
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
      className="flex-1 py-[18px] rounded-[14px] items-center"
      style={{
        backgroundColor: active ? COLORS.accent : COLORS.accentSoft,
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className="text-[13px] font-semibold"
        style={{ color: active ? '#FFFFFF' : COLORS.accentDark }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function Pill({ text, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      className="px-4 py-2 rounded-[20px]"
      style={{
        backgroundColor: active ? COLORS.accent : COLORS.accentSoft,
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className="font-semibold"
        style={{ color: active ? '#FFFFFF' : COLORS.accentDark }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function ActivityBtn({ text, active, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      className="w-[48%] py-3.5 rounded-[22px] items-center"
      style={{
        backgroundColor: active ? COLORS.accent : COLORS.accentSoft,
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        className="text-[14px] font-semibold"
        style={{ color: active ? '#FFFFFF' : COLORS.accentDark }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
