import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { goBackOrReplace } from '../../services/navigation';

import SvgHeader from '../../components/Clipperbg';

// IMAGES
import digestionImg from '../../assets/images/analysis/digestion.png';
import respiratoryImg from '../../assets/images/analysis/respiratory.png';
import dietImg from '../../assets/images/analysis/diet.png';
import supplementImg from '../../assets/images/analysis/supplements.png';
import relaxImg from '../../assets/images/analysis/relaxation.png';

export default function AnalysisRecommendationScreen() {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 bg-white">
      {/* ================= HEADER ================= */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row justify-between">
              <TouchableOpacity onPress={() => goBackOrReplace('/process')}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: 200,
          paddingBottom: 250,
        }}
      >
        <View className="bg-white px-6 pt-8">
          {/* TITLE */}
          <Text className="text-green-700 text-[30px] font-extrabold text-center leading-[38px]">
            Step-by-Step{'\n'}Analysis &{'\n'}Recommendations
          </Text>

          <Text className="text-gray-700 text-center mt-4 text-[15px] leading-5">
            Based on what you shared,{'\n'}here is your personalized analysis.
          </Text>

          {/* PROGRESS */}
          <View className="mt-6">
            <View className="h-3 bg-green-200 rounded-full overflow-hidden">
              <View className="h-3 bg-green-600 w-[55%]" />
            </View>
            <Text className="text-center text-gray-800 text-[13px] mt-2">
              Step 1 of 2
            </Text>
          </View>

          {/* SUPPORT HEADER */}
          <View className="flex-row justify-between items-center mt-8 mb-4">
            <Text className="text-green-700 text-[18px] font-bold">
              Your Body Needs Support In:
            </Text>
            <Text className="text-green-600 font-semibold">
              See all
            </Text>
          </View>

          {/* BIG CARD */}
          <View className="rounded-[26px] overflow-hidden mb-5">
            <Image
              source={digestionImg}
              style={{ width: '100%', height: 220 }}
              resizeMode="contain"
            />
          </View>

          {/* MINI CARDS */}
          <View className="flex-row justify-between mb-8">
            <MiniSupportCard image={respiratoryImg} />
            <MiniSupportCard image={respiratoryImg} />
          </View>

          {/* RECOMMENDED ACTIVITIES */}
          <Text className="text-green-700 text-[18px] font-bold mb-4">
            Recommended Activities:
          </Text>

          {/* ✅ ROUTED CARD */}
          <ActivityCard
            image={dietImg}
            title="Daily Diet Swaps"
            subtitle="Foods and drinks to add or limit"
            showRightArrow
            onPress={() => router.push('/analysis/dailydietswaps')}
          />

          <ActivityCard
            image={supplementImg}
            title="Natural Supplements"
            subtitle="Gentle boosters for immunity & recovery"
          />

          <ActivityCard
            image={relaxImg}
            title="Relaxation Exercises"
            subtitle="Easy, calming practices for stress"
            showRightArrow
          />

          {/* CTA */}
          <View className="mt-10">
            <Text className="text-green-700 text-[22px] font-extrabold mb-4">
              Would you like more detailed plans?
            </Text>

            <View className="bg-green-100 rounded-[24px] p-5 flex-row">
              <View className="w-14 h-14 bg-white rounded-2xl mr-4" />
              <Text className="flex-1 text-gray-900 text-[14px] font-semibold">
                Our NIT system can analyze your medical reports and suggest a
                tailored Natural Immunotherapy plan.
              </Text>
            </View>

            <TouchableOpacity className="bg-green-600 py-4 rounded-full items-center mt-5">
              <Text className="text-white text-[16px] font-bold">
                Upload Medical Reports Now →
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-700 text-[13px] mt-4 px-3">
              This step is optional. You can continue with customized diet &
              lifestyle guidance.
            </Text>
          </View>

          <View className="h-10" />
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= COMPONENTS ================= */

function MiniSupportCard({ image }: { image: any }) {
  return (
    <TouchableOpacity className="w-[48%] rounded-[20px] overflow-hidden">
      <View className="bg-green-600 p-4 relative">
        <View className="absolute right-0 top-0 w-20 h-20 bg-green-400 rotate-45 translate-x-8 -translate-y-8" />

        <Image source={image} className="w-12 h-12" resizeMode="contain" />

        <Text className="text-white text-[13px] font-extrabold mt-2">
          Respiratory{'\n'}System
        </Text>

        <Text className="text-green-100 text-[11px] mt-1">
          Boosting lung function
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ================= ACTIVITY CARD ================= */

type ActivityCardProps = {
  image: any;
  title: string;
  subtitle: string;
  showRightArrow?: boolean;
  onPress?: () => void;
};

function ActivityCard({
  image,
  title,
  subtitle,
  showRightArrow,
  onPress,
}: ActivityCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      className="bg-green-600 rounded-[24px] p-5 mb-4 flex-row items-center"
    >
      <View className="w-[62px] h-[62px] bg-white rounded-[18px] items-center justify-center mr-4">
        <Image source={image} className="w-10 h-10" resizeMode="contain" />
      </View>

      <View className="flex-1">
        <Text className="text-white text-[17px] font-extrabold">
          {title}
        </Text>
        <Text className="text-green-100 text-[13px] mt-1">
          {subtitle}
        </Text>
      </View>

      {showRightArrow && (
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );
}
