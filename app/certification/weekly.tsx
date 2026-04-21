import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import WellnessDisclaimer from '../../components/WellnessDisclaimer';
import { usePatientProfile } from '../../hooks/use-patient-profile';
import { goBackOrReplace } from '../../services/navigation';

const profileImg = require('../../assets/images/profile.png');

export default function WeeklyImmunityReport() {
  const { patientName, patientPhoto } = usePatientProfile();

  return (
    <View className="flex-1 bg-[#f4f7fb]">
      <ScreenNav onBackPress={() => goBackOrReplace('/immunity/weeklyimmunity')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
          paddingBottom: 140,
        }}
      >
        <View className="px-5">
          <Text className="text-[30px] font-bold text-[#0b4ea2] mb-6">
            Weekly Wellness{"\n"}Check Summary
          </Text>

          <View className="bg-[#0b4ea2] rounded-[22px] p-4 flex-row items-center mb-6">
            <View className="flex-1">
              <Text className="text-white text-[14px] mb-1">Profile Name</Text>

              <Text className="text-white text-[20px] font-bold mb-2">
                {patientName}
              </Text>

              <View className="bg-white px-3 py-1 rounded-full self-start">
                <Text className="text-[#0b4ea2] font-semibold text-[14px]">
                  Immunity Lifestyle Score - 8.3 / 10
                </Text>
              </View>
            </View>

            <Image
              source={patientPhoto ? { uri: patientPhoto } : profileImg}
              className="w-20 h-20 rounded-full ml-4"
              resizeMode="cover"
            />
          </View>

          <View className="bg-[#1fa2ff] px-5 py-2 rounded-full self-start mb-4">
            <Text className="text-white font-semibold text-[14px]">
              Wellness Check Complete
            </Text>
          </View>

          <Text className="text-[15px] text-[#1f3c66] leading-6 mb-6">
            Weekly Wellness Check Summary is a structured lifestyle snapshot
            generated from your weekly immunity self-check. It reflects your
            overall wellness patterns from the past week.
          </Text>

          <View className="bg-[#dbe9f8] rounded-[18px] h-[260px] mb-6" />

          <Text className="text-[15px] text-[#1f3c66] leading-6 mb-10">
            This wellness check suggests steady daily balance and immune
            resilience patterns. Most lifestyle signals appear supportive or
            improving based on the answers shared this week.
          </Text>

          <WellnessDisclaimer className="mb-10" />

          <View className="items-center mb-12">
            <Ionicons name="checkmark-circle" size={56} color="#1fa2ff" />

            <Text className="text-center text-[15px] text-[#1f3c66] leading-6">
              Your Personal Wellness Insights are ready for weekly lifestyle
              review.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
