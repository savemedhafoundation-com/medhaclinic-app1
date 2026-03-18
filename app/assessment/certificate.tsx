import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

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
    <View className="flex-1 bg-[#F5FAFF] px-5 pt-8">
      <Text className="text-[28px] font-bold text-[#0B4F8A]">
        Assessment Summary
      </Text>
      <Text className="text-[#4B5563] mt-2">
        Here are your results based on the answers you provided.
      </Text>

      <View className="mt-6 rounded-[20px] bg-white p-5 border border-[#E2ECF7]">
        <Text className="text-[14px] text-[#6B7280]">Overall Health Score</Text>
        <Text className="text-[32px] font-bold text-[#0B4F8A] mt-1">
          {resolvedHealth}
        </Text>
      </View>

      <View className="mt-4 rounded-[20px] bg-white p-5 border border-[#E2ECF7]">
        <Text className="text-[14px] text-[#6B7280]">Immunity Score</Text>
        <Text className="text-[28px] font-bold text-[#0B4F8A] mt-1">
          {resolvedImmunity}
        </Text>
      </View>

      <TouchableOpacity
        className="mt-8 bg-[#0B4F8A] py-4 rounded-[30px] items-center"
        onPress={() => router.push('/(tabs)/dashboard')}
      >
        <Text className="text-white font-semibold text-[16px]">Go to Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-3 items-center" onPress={() => router.back()}>
        <Text className="text-[#0B4F8A]">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
