import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// BACKGROUND + LOGO
import bg from '../../assets/images/common_bgpage.png';
import logo from '../../assets/images/medha_logo.png';
import { useWindowDimensions } from 'react-native';

// IMAGES (use your assets)
import digestionImg from '../../assets/images/analysis/digestion.png';
import respiratoryImg from '../../assets/images/analysis/respiratory.png';
import dietImg from '../../assets/images/analysis/diet.png';
import supplementImg from '../../assets/images/analysis/supplements.png';
import relaxImg from '../../assets/images/analysis/relaxation.png';
import uploadImg from '../../assets/images/analysis/upload.png'; // optional (can remove)

export default function AnalysisRecommendationScreen() {
const { width: screenWidth } = useWindowDimensions();

  return (
    <ImageBackground source={bg} resizeMode="cover" className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* ================= TOP GREEN HEADER ONLY (LOGO) ================= */}
        <View className="bg-green-600 pt-14 pb-16 px-5 relative">
          {/* top nav */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
              <Ionicons name="chevron-back" size={22} color="#16a34a" />
            </TouchableOpacity>

            <View className="items-center">
              <Image source={logo} className="w-44 h-32" resizeMode="contain" />
            </View>

            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* fake wave: white overlay with big radius */}
          <View className="absolute left-0 right-0 -bottom-10 h-20 bg-white rounded-t-[40px]" />
        </View>

        {/* ================= WHITE CONTENT AREA ================= */}
        <View className="bg-white px-5 pt-10 pb-14">
          {/* TITLE (on white, like screenshot) */}
          <Text className="text-green-700 text-[30px] font-extrabold leading-[38px] text-center">
            Step-by-Step{'\n'}Analysis &{'\n'}Recommendations
          </Text>

          <Text className="text-gray-700 text-center mt-4 text-[15px] px-6 leading-5">
            Based on what you shared, here{'\n'}is your personalized analysis.
          </Text>

          {/* PROGRESS (in white section) */}
          <View className="mt-6">
            <View className="h-3 bg-green-200 rounded-full overflow-hidden">
              <View className="h-3 bg-green-600 w-[55%] rounded-full" />
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
            <TouchableOpacity>
              <Text className="text-green-600 text-[15px] font-semibold">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* BIG SUPPORT CARD (with diagonal corner like screenshot) */}
          <View className="rounded-[26px] overflow-hidden mb-5">
      <Image
                  source={digestionImg}
  style={{ width: screenWidth, height: 224 }}
                  resizeMode="contain"
                />
          </View>

          {/* MINI SUPPORT CARDS (2 like screenshot) */}
          <View className="flex-row justify-between mb-8">
            <MiniSupportCard image={respiratoryImg} />
            <MiniSupportCard image={respiratoryImg} />
          </View>

          {/* RECOMMENDED ACTIVITIES */}
          <Text className="text-green-700 text-[18px] font-bold mb-4">
            Recommended Activities:
          </Text>

          <ActivityCard
            image={dietImg}
            title="Daily Diet Swaps"
            subtitle="Foods and drinks to add or limit"
            showRightArrow={false}
          />

          <ActivityCard
            image={supplementImg}
            title="Natural Supplements"
            subtitle="Gentle boosters for immunity & recovery"
            showRightArrow={false}
          />

          <ActivityCard
            image={relaxImg}
            title="Relaxation Exercises"
            subtitle="Easy, Calming, Practices for Stress"
            showRightArrow
          />

          {/* UPLOAD CTA (green section like screenshot) */}
          <View className="mt-10">
            <Text className="text-green-700 text-[22px] font-extrabold mb-4">
              Would you like more detailed plans?
            </Text>

            <View className="bg-green-100 rounded-[24px] p-5 flex-row items-center">
              <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4">
                {/* <Image
                  source={uploadImg}
                  className="w-9 h-9"
                  resizeMode="contain"
                /> */}
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 text-[14px] font-semibold leading-5">
                  Our NIT system can analyze your medical reports and suggest a
                  tailored Natural Immunotherapy plan.
                </Text>
              </View>
            </View>

            <TouchableOpacity className="bg-green-600 py-4 rounded-full items-center mt-5">
              <Text className="text-white text-[16px] font-bold">
                Upload Medical Reports Now  →
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-700 text-[13px] mt-4 leading-5 px-3">
              This step is optional. You can continue your journey with
              customized diet & lifestyle guidance
            </Text>
          </View>

          {/* bottom spacing */}
          <View className="h-10" />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* ================= COMPONENTS ================= */

function MiniSupportCard({ image }: { image: any }) {
  return (
    <TouchableOpacity className="w-[48%] rounded-[20px] overflow-hidden">
      <View className="bg-green-600 p-4 relative">
        {/* diagonal accent */}
        <View className="absolute right-0 top-0 w-20 h-20 bg-green-400 rotate-45 translate-x-8 -translate-y-8" />

        <Image source={image} className="w-12 h-12" resizeMode="contain" />

        <View className="flex-row justify-between items-start mt-2">
          <View className="flex-1 pr-3">
            <Text className="text-white text-[13px] font-extrabold">
              Respiratory{'\n'}System
            </Text>
            <Text className="text-green-100 text-[11px] mt-1">
              Boosting lung function{'\n'}oxygen flow
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#eafff2" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ActivityCard({
  image,
  title,
  subtitle,
  floatingRightImage,
  showRightArrow,
}: {
  image: any;
  title: string;
  subtitle: string;
  floatingRightImage?: any;
  showRightArrow?: boolean;
}) {
  return (
    <TouchableOpacity className="bg-green-600 rounded-[24px] p-5 mb-4 flex-row items-center relative overflow-visible">
      {/* left icon tile */}
      <View className="w-[62px] h-[62px] bg-white rounded-[18px] items-center justify-center mr-4">
        <Image source={image} className="w-10 h-10" resizeMode="contain" />
      </View>

      <View className="flex-1">
        <Text className="text-white text-[17px] font-extrabold">
          {title}
        </Text>
        <Text className="text-green-100 text-[13px] mt-1 leading-5">
          {subtitle}
        </Text>
      </View>

      {showRightArrow ? (
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      ) : null}

      {/* floating right tile (Natural Supplements) */}
      {floatingRightImage ? (
        <View className="absolute right-4 top-[-18px] w-16 h-16 bg-white rounded-[18px] items-center justify-center shadow-lg">
          <Image
            source={floatingRightImage}
            className="w-9 h-9"
            resizeMode="contain"
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
