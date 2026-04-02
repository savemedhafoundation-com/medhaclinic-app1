import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SvgHeader from '../../components/Clipperbg';
import { usePatientProfile } from '../../hooks/use-patient-profile';
import { goBackOrReplace } from '../../services/navigation';

/* ===== ASSETS ===== */
const profileImg = require('../../assets/images/profile.png');
const badge = require('../../assets/images/badge.png');

const HEADER_HEIGHT = 230;

export default function WeeklyImmunityReport() {
  const { patientName, patientPhoto } = usePatientProfile();

  return (
    <View className="flex-1 bg-[#f4f7fb]">
      {/* ===== HEADER ===== */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <SvgHeader />

        <SafeAreaView className="absolute top-0 w-full px-4">
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity onPress={() => goBackOrReplace('/immunity/weeklyimmunity')}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={{ height: HEADER_HEIGHT }} />

        <View className="px-5">
          {/* TITLE */}
          <Text className="text-[30px] font-bold text-[#0b4ea2] mb-6">
            Weekly Immunity{"\n"}Status Report
          </Text>

          {/* ===== PATIENT CARD ===== */}
          <View className="bg-[#0b4ea2] rounded-[22px] p-4 flex-row items-center mb-6">
            <View className="flex-1">
              <Text className="text-white text-[14px] mb-1">
                Patient Name
              </Text>

              <Text className="text-white text-[20px] font-bold mb-2">
                {patientName}
              </Text>

              <View className="bg-white px-3 py-1 rounded-full self-start">
                <Text className="text-[#0b4ea2] font-semibold text-[14px]">
                  Immunity Score – 8.3 / 10
                </Text>
              </View>
            </View>

            <Image
              source={patientPhoto ? { uri: patientPhoto } : profileImg}
              className="w-20 h-20 rounded-full ml-4"
              resizeMode="cover"
            />
          </View>

          {/* ===== CONGRATS CHIP ===== */}
          <View className="bg-[#1fa2ff] px-5 py-2 rounded-full self-start mb-4">
            <Text className="text-white font-semibold text-[14px]">
              Congratulations
            </Text>
          </View>

          {/* ===== DESCRIPTION ===== */}
          <Text className="text-[15px] text-[#1f3c66] leading-6 mb-6">
            Weekly Immunity Status Certificate is a structured digital wellness
            document generated from a weekly immunity self-assessment. It reflects
            the individual’s overall immune balance by evaluating key functional
            health indicators over the past week.
          </Text>

          {/* ===== PLACEHOLDER PANEL ===== */}
          <View className="bg-[#dbe9f8] rounded-[18px] h-[260px] mb-6" />

          {/* ===== ANALYSIS TEXT ===== */}
          <Text className="text-[15px] text-[#1f3c66] leading-6 mb-10">
            The immunity checkup indicates that the body is maintaining strong
            internal balance and immune resilience. Most core health indicators
            are in a healthy or improving range, which reflects a well-supported
            immune system.
          </Text>

          {/* ===== CERTIFIED BADGE ===== */}
          <View className="items-center mb-12">
            <Image
              source={badge}
              className="w-16 h-16 mb-3"
              resizeMode="contain"
            />

            <Text className="text-center text-[15px] text-[#1f3c66] leading-6">
              Certified healthy and fit for all normal{"\n"}
              activities and travel.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
