import {
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CgProfile } from "react-icons/cg";

// Assets
import logo from '../../assets/images/medha_logo.png';
import checkIcon from '../../assets/images/check.png';
import badge from '../../assets/images/badge.png';
import profile from '../../assets/images/profile.png';
import BottomNav from '../../components/BottomNav';
import SvgHeader from '../../components/Clipperbg';

export default function CertificatePage() {
  const router = useRouter();

  // ✅ RECEIVE DATA FROM PROCESS SCREEN
  const {
    healthScore = '0.0',
    immunityScore = '0.0',
    patientName = 'Sachin Biswas', // future-ready
  } = useLocalSearchParams();

  // ✅ OPTIONAL: Convert to numbers if needed later
  const health = Number(healthScore);
  const immunity = Number(immunityScore);

  return (
        <View className="flex-1 bg-[#f5f6f8]">
    <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full">
          <View className="h-14 justify-center mt-4">
            <View className="absolute left-4 right-4 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="menu" size={26} color="#fff" />
            </View>

            <View className="items-center">
              <Image
                source={logo}
                className="w-[150px] h-[100px]"
                resizeMode="contain"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    <ScrollView
     showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 220,
          paddingBottom: 240,
        }}
        className="px-4"
    >
      {/* ================= HEADER ================= */}
    

      {/* ================= TITLE ================= */}


      {/* ================= PATIENT CARD ================= */}
      <View className="bg-[#1E73C9] mx-6 mt-8 rounded-2xl p-5 flex-row items-center">
        <View className="flex-1">
          <Text className="text-white text-lg">
            Patient Name
          </Text>
          <Text className="text-white text-2xl font-bold">
            {patientName}
          </Text>

          <View className="bg-white mt-3 px-3 py-1 rounded-md self-start">
            <Text className="text-[#1E73C9] font-semibold">
              Health Score – {health.toFixed(1)} / 10
            </Text>
          </View>
        </View>

        <Image
          source={profile}
          className="w-20 h-20 rounded-full ml-4"
        />
      </View>

      {/* ================= MESSAGE ================= */}
      <View className="px-6 mt-8">
        <View className="bg-[#238AF3] rounded-xl px-6 py-3 self-start mb-4">
          <Text className="text-white font-semibold text-lg">
            Congratulations
          </Text>
        </View>

        <Text className="text-gray-700 text-[16px] leading-7">
          This certifies that {patientName} is in excellent
          health condition, having achieved a Health Score
          of {health.toFixed(1)}/10.
        </Text>
      </View>

      {/* ================= CHECKLIST ================= */}
      <View className="px-6 mt-6 space-y-4">
        {[
          'All recent medical tests are normal, showing no health concerns.',
          'Immunity and health scores indicate excellent wellness.',
          'This certificate affirms a clean bill of health.',
        ].map((item, index) => (
          <View key={index} className="flex-row items-start">
            <Image
              source={checkIcon}
              className="w-6 h-6 mt-1 mr-3"
            />
            <Text className="text-gray-700 text-[16px] flex-1">
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* ================= SEAL ================= */}
      <View className="items-center mt-10">
        <Image
          source={badge}
          className="w-20 h-20 mb-4"
        />
        <Text className="text-center text-gray-800 text-[16px] leading-6 px-8">
          Certified healthy and fit for all normal
          activities and travel.
        </Text>
      </View>
    </ScrollView>
        <View className="absolute bottom-0 left-0 right-0">
    <BottomNav />
  </View>
    </View>
    
  );
}
