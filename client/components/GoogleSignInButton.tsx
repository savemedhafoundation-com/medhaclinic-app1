import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type GoogleSignInButtonProps = {
  loading?: boolean;
  onPress: () => void;
};

export default function GoogleSignInButton({
  loading = false,
  onPress,
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={loading}
      onPress={onPress}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 15,
        shadowColor: '#0b3f16',
        shadowOpacity: 0.14,
        shadowRadius: 18,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-center">
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#f4f8f4',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#15803d" size="small" />
          ) : (
            <Ionicons name="logo-google" size={20} color="#ea4335" />
          )}
        </View>

        <Text className="ml-3 text-[16px] font-semibold text-[#0f172a]">
          {loading ? 'Connecting to Google...' : 'Continue with Google'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
