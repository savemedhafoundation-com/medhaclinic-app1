import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';

import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bg from '../assets/images/dashbg.png';
import logo from '../assets/images/medha_logo.png';
import { goBackOrReplace } from '../services/navigation';

const veg = require('../assets/images/veg.png');
const nonveg = require('../assets/images/nonveg.png');
const vegan = require('../assets/images/vegan.png');
const mixed = require('../assets/images/mixed_diet.png');

const COLORS = {
  accent: '#16a34a',
  accentDark: '#176E18',
  accentMuted: '#4F7653',
  accentSoft: '#E7F8DD',
  accentSoftStrong: '#DFF4D1',
  card: '#FFFFFF',
  screen: '#F7FFF2',
};

export default function FoodPreferencesScreen() {
  const { activityLevel, eatingHabits, mealsPerDay } = useLocalSearchParams<{
    activityLevel?: string;
    eatingHabits?: string;
    mealsPerDay?: string;
  }>();
  const [selected, setSelected] = useState<string | null>('mixed');
  const [other, setOther] = useState('');

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.screen }}>
      {/* ===== APP BAR ===== */}
      <ImageBackground
        source={bg}
        className="w-full h-[220px]"
        resizeMode="stretch"
      >
        <LinearGradient
          colors={['rgba(24,184,3,0.92)', 'rgba(24,184,3,0.72)']}
          className="flex-1"
        >
          <SafeAreaView className="flex-1 justify-center px-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => goBackOrReplace('/dietscreen')}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>

              <Image
                source={logo}
                className="w-[180px] h-[60px]"
                resizeMode="contain"
              />

              <View className="w-[26px]" />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
      >
        {/* ===== TITLE ===== */}
        <Text className="mt-2 mb-5">
          <Text
            className="text-[28px] font-bold"
            style={{ color: COLORS.accentDark }}
          >
            Your Food Preferences{'\n'}
          </Text>
          <Text
            className="text-[16px]"
            style={{ color: COLORS.accentMuted }}
          >
            Please tell us about your dietary preferences
          </Text>
        </Text>

        {/* ===== SECTION TITLE ===== */}
        <Text
          className="text-[18px] font-bold mb-3"
          style={{ color: COLORS.accentDark }}
        >
          Select your diet type
        </Text>

        {/* ===== FOOD OPTIONS ===== */}
        <FoodCard
          image={veg}
          title="Vegetarian"
          desc="I do not eat meat, but consume dairy, eggs, or both"
          active={selected === 'vegetarian'}
          onPress={() => setSelected('vegetarian')}
        />

        <FoodCard
          image={nonveg}
          title="Non-vegetarian"
          desc="I eat meat, poultry or fish"
          active={selected === 'nonveg'}
          onPress={() => setSelected('nonveg')}
        />

        <FoodCard
          image={vegan}
          title="Vegan"
          desc="I do not eat meat, dairy or eggs"
          active={selected === 'vegan'}
          onPress={() => setSelected('vegan')}
        />

        <FoodCard
          image={mixed}
          title="Mixed Diet"
          desc="Sometimes vegetarian, sometimes meat"
          active={selected === 'mixed'}
          onPress={() => setSelected('mixed')}
        />

        {/* ===== OPTIONAL INPUT ===== */}
        <TextInput
          className="rounded-[24px] px-[18px] py-3.5 mt-2.5 text-[14px]"
          style={{
            backgroundColor: COLORS.card,
            color: COLORS.accentDark,
          }}
          placeholder="Any other dietary preferences? (Optional)"
          placeholderTextColor="#6C8A6C"
          value={other}
          onChangeText={setOther}
        />

        {/* ===== CTA ===== */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-3.5 rounded-[30px] gap-1.5 mt-5"
          style={{ backgroundColor: COLORS.accent }}
          onPress={() =>
            router.push(
              `/boosterdiet/dietplan?activityLevel=${encodeURIComponent(activityLevel ?? 'Lightly active')}&eatingHabits=${encodeURIComponent(eatingHabits ?? 'Moderate')}&mealsPerDay=${encodeURIComponent(mealsPerDay ?? '3')}&dietType=${encodeURIComponent(selected ?? 'mixed')}&otherPreferences=${encodeURIComponent(other.trim())}`
            )
          }
        >
          <Text className="text-white text-[16px] font-semibold">
            Next
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

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav />
    </View>
  );
}

/* ================= FOOD CARD ================= */

function FoodCard({
  image,
  title,
  desc,
  active,
  onPress,
}: {
  image: any;
  title: string;
  desc: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row rounded-[20px] p-3 mb-3.5 gap-3 ${
        active ? 'border-2' : ''
      }`}
      style={{
        backgroundColor: active ? COLORS.accentSoftStrong : COLORS.accentSoft,
        borderColor: active ? COLORS.accent : 'transparent',
      }}
    >
      <Image
        source={image}
        className="w-[90px] h-[90px] rounded-[14px]"
      />

      <View className="flex-1">
        <Text
          className="text-[16px] font-bold"
          style={{ color: COLORS.accentDark }}
        >
          {title}
        </Text>
        <Text
          className="text-[13px] mt-1"
          style={{ color: COLORS.accentMuted }}
        >
          {desc}
        </Text>

        <View className="mt-2">
          <Text
            className="text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-[14px] self-start"
            style={{ backgroundColor: COLORS.accent }}
          >
            Know More
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
