import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { goBackOrReplace } from '../../services/navigation';

export default function NextStepScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F5FAFF] px-5 pt-8">
      <Text className="text-[26px] font-bold text-[#0B4F8A]">Next Step</Text>
      <Text className="text-[#4B5563] mt-2">
        We will use your responses to personalize your plan.
      </Text>

      <TouchableOpacity
        className="mt-6 bg-[#1fa2ff] py-3.5 rounded-[30px] items-center"
        onPress={() => router.push('/(tabs)/dashboard')}
      >
        <Text className="text-white text-[16px] font-semibold">Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-3 items-center"
        onPress={() => goBackOrReplace('/(tabs)/dashboard')}>
        <Text className="text-[#0B4F8A]">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
