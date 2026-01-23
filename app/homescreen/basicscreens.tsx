import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import bg from '../../assets/images/common_bgpage.png';
import logo from '../../assets/images/medha_logo.png';

export default function BasicDetailsScreen() {
  return (
    <ImageBackground source={bg} className="flex-1" resizeMode="cover">
      <LinearGradient
        colors={['rgba(255,255,255,0.85)', 'rgba(0,40,90,0.65)']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

          {/* LOGO */}
          <Image source={logo} className="w-[220px] h-[80px] self-center mb-5" resizeMode="contain" />

          {/* HEADER */}
          <Text className="text-[32px] font-bold text-[#0b4ea2]">Let's Get started</Text>
          <Text className="text-[16px] text-[#1f3c66] mt-1.5 mb-5">
            Please tell us a bit about yourself so we can guide your health journey.
          </Text>

          {/* STEP */}
          <Text className="text-[14px] text-[#0b4ea2] mb-1.5">Step 1 of 2</Text>
          <View className="h-[6px] bg-[#d6e6ff] rounded-[3px] mb-6">
            <View className="h-[6px] bg-[#0b4ea2] rounded-[3px]" style={{ width: '50%' }} />
          </View>

          {/* CARDS */}
          <InfoCard
            icon="person"
            title="Basic Details"
            desc="Know your Health abilities"
          />

          <InfoCard
            icon="restaurant"
            title="Diet & Lifestyle"
            desc="Tell us about your eating and sleeping habits and daily activity"

          />

          <InfoCard
            icon="nutrition"
            title="Your Food Preferences"
            desc="Are you vegetarian, non-vegetarian, or mixed?"
          />

          <InfoCard
            icon="medkit"
            title="Medical History"
            desc="Inform us of any existing medical diagnoses"
          />

          <InfoCard
            icon="accessibility"
            title="Current Symptoms"
            desc="Inform us of any existing medical diagnoses"
          />

          {/* FOOTER TEXT */}
          <Text className="text-center text-[13px] text-[#1f3c66] mt-5">
            All fields are optional, but more information means better care for you.
            Your details will remain confidential.
          </Text>

          <TouchableOpacity>
            <Text className="text-center text-[#0b4ea2] mt-2">Skip for now</Text>
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity className="mt-5 flex-row self-center items-center bg-[#1fa2ff] px-10 py-3.5 rounded-[30px] gap-2">
            <Text className="text-white text-[16px] font-semibold">Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

/* ---------- CARD COMPONENT ---------- */
function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center bg-[#0b4ea2] rounded-[26px] p-4 mb-3.5">
      <View className="w-11 h-11 rounded-full bg-white items-center justify-center mr-3.5">
        <Ionicons name={icon} size={22} color="#0b4ea2" />
      </View>

      <View style={{ flex: 1 }}>
        <Text className="text-white text-[16px] font-semibold">{title}</Text>
        <Text className="text-[#d6ecff] text-[13px] mt-1">{desc}</Text>
      </View>

      <TouchableOpacity 
      onPress={() => router.push('/dietscreen')}
      className="bg-[#1fa2ff] px-3.5 py-1.5 rounded-[14px] ml-2.5">
        <Text className="text-white text-[12px]">know More</Text>

      </TouchableOpacity>
    </View>
  );
}
