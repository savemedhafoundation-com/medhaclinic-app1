import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  Dimensions,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import backgroundimg from '../../assets/images/common_bgpage.png';
const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  return (
    <ImageBackground
      source={backgroundimg} // change path if needed
      className="flex-1"
      resizeMode="cover"
    >
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,90,160,0.65)', 'rgba(0,40,90,0.65)']}
        style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }}
      >
        {/* Header */}
        <View className="mt-20">
          <Text className="text-white text-[26px] font-light">Be a part of</Text>
          <Text className="text-white text-[34px] font-bold my-1">Medha Clinic</Text>
          <Text className="text-[#d6ecff] text-[14px] mt-1.5">
            Login to continue to MedhaClinic
          </Text>
        </View>

        {/* Login Card */}
        <View className="bg-[rgba(255,255,255,0.12)] rounded-[24px] p-5">
          <TextInput
            placeholder="Phone number or Email"
            placeholderTextColor="#cfe8ff"
            className="bg-[rgba(255,255,255,0.15)] rounded-[30px] px-5 py-3.5 text-white mb-3.5"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#cfe8ff"
            secureTextEntry
            className="bg-[rgba(255,255,255,0.15)] rounded-[30px] px-5 py-3.5 text-white mb-3.5"
          />

          <TouchableOpacity className="bg-[#1fa2ff] py-3.5 rounded-[30px] items-center mt-1.5">
            <Text className="text-white text-[16px] font-semibold">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-[#cfe8ff] text-center mt-3">Forget Password?</Text>
          </TouchableOpacity>

          <Text className="text-[#cfe8ff] text-center my-2.5">OR</Text>

          <TouchableOpacity className="border border-[#5bbcff] py-3 rounded-[30px] items-center">
            <Text className="text-[#cfe8ff] text-[15px]">login with OTP</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-20 items-center">
          <Text className="text-[#cfe8ff]">
            Don't have an account?{' '}
            <Text
              className="text-white font-semibold"
              onPress={() => router.push('/(tabs)/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>

      </LinearGradient>
    </ImageBackground>
  );
}
