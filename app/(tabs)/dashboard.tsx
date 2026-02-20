import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const logo = require('../../assets/images/medha_logo.png');
const bgImage = require('../../assets/images/dashbg.png');

export default function HomeScreen() {
  return (
    <ImageBackground source={bgImage} resizeMode="cover" className="flex-1">
      {/* 🌿 Light global green overlay */}


      <View className="flex-1 bg-[#0f3d12]/55">
        <SafeAreaView className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          >

            {/* ================= HEADER ================= */}
{/* ================= HEADER ================= */}
<LinearGradient
  colors={[
    'rgba(34,197,94,0.35)',
    'rgba(22,163,74,0.25)',
    'rgba(21,128,61,0.15)',
  ]}
  className="pb-8 items-center"
>

  {/* Top Bar */}
  {/* <View className="w-full flex-row items-center justify-between px-5 pt-4">
    <TouchableOpacity className="bg-white/25 p-2 rounded-full">
      <Ionicons name="chevron-back" size={28} color="#fff" />
      
    </TouchableOpacity>
  
  </View> */}

  {/* Logo - pushed up */}
  <View className="items-center -mt-2">
    <Image
      source={logo}
      className="w-[260px] h-[150px]"
      resizeMode="contain"
    />
  </View>

  {/* Centered Text */}
  <View className="items-center px-8">
    <Text className="text-white text-[24px] font-light text-center">
      Welcome to
    </Text>

    <Text className="text-white text-[35px] font-bold text-center">
      Medha Clinic
    </Text>

    <Text className="text-white/90 text-[16px] leading-[24px] text-center mt-3">
      We are here to understand your body and guide recovery naturally
    </Text>
  </View>

</LinearGradient>

            {/* ================= ACTION CARDS ================= */}
            <View className="px-5 mt-6">

              {/* Card 1 */}
              <TouchableOpacity className="bg-[#1fa21f]/90 rounded-[26px] p-5 flex-row items-center mb-4"onPress={() => router.push('/homescreen/basicscreens')}>
                <View className="bg-white p-3 rounded-xl mr-4">
                  <Ionicons name="stats-chart" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[20px] font-bold">
                    Basic Health Assessment
                  </Text>
                  <Text className="text-white/80 text-[13px] mt-1">
                    Tell us about your body, lifestyle, and how you’re feeling.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>

              {/* Card 2 */}
                  <TouchableOpacity className="bg-[#1fa21f]/90 rounded-[26px] p-5 flex-row items-center mb-4"onPress={() => router.push('/homescreen/basicscreens')}>
                <View className="bg-white p-3 rounded-xl mr-4">
                  <Ionicons name="stats-chart" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[20px] font-bold">
                    Moderate Health Assessment                  </Text>
                  <Text className="text-white/80 text-[13px] mt-1">
                    Tell us about your body, lifestyle, and how you’re feeling.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
       <TouchableOpacity className="bg-[#1fa21f]/90 rounded-[26px] p-5 flex-row items-center mb-4"onPress={() => router.push('/homescreen/basicscreens')}>
                <View className="bg-white p-3 rounded-xl mr-4">
                  <Ionicons name="stats-chart" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[20px] font-bold">
                    Critical Health Assessment
                  </Text>
                  <Text className="text-white/80 text-[13px] mt-1">
                    Tell us about your body, lifestyle, and how you’re feeling.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
              {/* Card 3 */}
              <TouchableOpacity className="bg-[#1fa21f]/90 rounded-[26px] p-5 flex-row items-center">
                <View className="bg-white p-3 rounded-xl mr-4">
                  <Ionicons name="leaf" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-[20px] font-bold">
                    Natural Immunotherapy
                  </Text>
                  <Text className="text-white/80 text-[13px] mt-1">
                    Learn how healing through natural immunity works.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* ================= HOW MEDHA HELPS ================= */}
            {/* <View className="px-5 mt-12">
              <Text className="text-white text-[26px] font-bold mb-5">
                How Medha Clinic Helps :
              </Text>
<TouchableOpacity onPress={() => router.push('/analysis/stepanalyst')}>
              <View className="flex-row justify-between">
                <View className="bg-white/20 rounded-[18px] p-4 w-[48%]">
                  <Ionicons name="pulse" size={28} color="#eaffea" />
                  <Text className="text-white font-semibold mt-3">
                    Understand What’s Happening Inside Your Body
                  </Text>
                </View>
                <View className="bg-white/20 rounded-[18px] p-4 w-[48%]">
                  <Ionicons name="nutrition" size={28} color="#eaffea" />
                  <Text className="text-white font-semibold mt-3">
                    Personalized Diet & Nutrition Guidance
                  </Text>
                </View>
              </View>
              </TouchableOpacity>

            </View> */}

            {/* ================= WHAT APP DOES NOT DO ================= */}
            <View className="px-5 mt-10">
              <View className="border border-white/30 rounded-[18px] p-4">
                <Text className="text-white text-[18px] font-bold mb-4">
                  What This App Does NOT Do
                </Text>

                {[
                  'Replace emergency treatment',
                  'Promise instant cure',
                  'Use fear-based language',
                  'Fake promises',
                ].map((item, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Ionicons name="close-circle" size={18} color="#f87171" />
                    <Text className="text-white ml-2">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ================= CTA ================= */}
  

          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
