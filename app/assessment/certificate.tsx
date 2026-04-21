import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import WellnessDisclaimer from '../../components/WellnessDisclaimer';
import { goBackOrReplace } from '../../services/navigation';

type Params = {
  healthScore?: string | string[];
  immunityScore?: string | string[];
};

const getParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export default function CertificateScreen() {
  const router = useRouter();
  const { healthScore, immunityScore } = useLocalSearchParams<Params>();

  const resolvedHealth = getParam(healthScore) ?? '0.0';
  const resolvedImmunity = getParam(immunityScore) ?? '0.0';

  return (
    <View className="flex-1 bg-[#F5FAFF]">
      <ScreenNav
        onBackPress={() => goBackOrReplace('/(tabs)/dashboard')}
        title="Wellness Check Summary"
      />

      <View className="flex-1 px-5" style={{ paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP }}>
        <Text className="text-[28px] font-bold text-[#0B4F8A]">
          Wellness Check Summary
        </Text>
        <Text className="text-[#4B5563] mt-2">
          Here are your Personal Wellness Insights based on the answers you provided.
        </Text>

        <View className="mt-6 rounded-[20px] bg-white p-5 border border-[#E2ECF7]">
          <Text className="text-[14px] text-[#6B7280]">Overall Wellness Score</Text>
          <Text className="text-[32px] font-bold text-[#0B4F8A] mt-1">
            {resolvedHealth}
          </Text>
        </View>

        <View className="mt-4 rounded-[20px] bg-white p-5 border border-[#E2ECF7]">
          <Text className="text-[14px] text-[#6B7280]">Immunity Lifestyle Score</Text>
          <Text className="text-[28px] font-bold text-[#0B4F8A] mt-1">
            {resolvedImmunity}
          </Text>
        </View>

        <WellnessDisclaimer className="mt-5" />

        <TouchableOpacity
          className="mt-8 bg-[#0B4F8A] py-4 rounded-[30px] items-center"
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <Text className="text-white font-semibold text-[16px]">Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
