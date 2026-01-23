import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Dimensions,
    Image,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bg from '../assets/images/common_bgpage.png';
import logo from '../assets/images/medha_logo.png';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  return (
    <ImageBackground source={bg} className="flex-1">
      <LinearGradient
        colors={['rgba(0,90,160,0.55)', 'rgba(0,40,90,0.65)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
          >
            {/* LOGO */}
            <Image
              source={logo}
              className="w-[220px] h-[80px] self-center mt-2 mb-4"
              resizeMode="contain"
            />

            <Text className="text-white text-[26px] font-bold">Welcome to Medha Clinic</Text>
            <Text className="text-[#d6ecff] mt-1.5 text-[15px] leading-[22px]">
              We are here to understand your body and guide recovery naturally
            </Text>

            <Text className="text-white text-[18px] mt-[26px] mb-3.5 font-semibold">
              What would you like to do today?
            </Text>

            <ActionCard
              title="Start Health Assessment"
              desc="Tell us about your body, lifestyle, and how you feel."
              onPress={() => router.push('/homescreen/basicscreens')}
            />

            <ActionCard
              title="Upload Medical Reports"
              desc="PDF, Image or Photo. You may continue without reports."
            />

            <ActionCard
              title="Understand Natural Immunotherapy"
              desc="Learn how healing through natural immunity works."
            />

            <View className="mt-[30px] bg-[rgba(0,0,0,0.35)] p-[18px] rounded-[20px]">
              <Text className="text-white text-[16px] font-bold mb-2.5">
                What This App Does NOT Do
              </Text>
              <InfoRow text="Replace emergency treatment" />
              <InfoRow text="Promise instant cure" />
              <InfoRow text="Use fear-based language" />
              <InfoRow text="Fake promises" />
            </View>
          </ScrollView>

          {/* BOTTOM NEXT BAR */}
          <View style={{ position: 'absolute', bottom: 106, left: 20, right: 20 }}>
            <TouchableOpacity
              className="h-14 rounded-[30px] bg-[#1fa2ff] items-center justify-center"
              style={{ bottom: 30 }}
            >
              <Text className="text-white text-[16px] font-semibold">Next</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

/* ---------- COMPONENTS ---------- */

function ActionCard({ title, desc, onPress }: any) {
  return (
    <TouchableOpacity
      className="bg-[rgba(255,255,255,0.16)] rounded-[22px] py-4 px-[18px] mb-3.5 flex-row items-center"
      style={{ width: width - 40 }}
      onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text className="text-white text-[16px] font-semibold">{title}</Text>
        <Text className="text-[#cfe8ff] mt-1.5 text-[13px] leading-[18px] w-[95%]">{desc}</Text>
      </View>
      <Text className="text-white text-[26px] ml-2.5">›</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mb-1.5">
      <Text className="text-[#ff5c5c] text-[16px] mr-2">✕</Text>
      <Text className="text-[#cfe8ff] text-[14px]">{text}</Text>
    </View>
  );
}
