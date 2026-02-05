import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import backgroundimg from '../assets/images/common_bgpage.png';
import medha from '../assets/images/medha_logo.png';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  return (
    <ImageBackground
      source={backgroundimg}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Gradient Overlay */}
 <LinearGradient
  colors={['#21E9461A', '#1B9C711A']}
  className="flex-1 px-6 justify-center"
>
        {/* 🔰 MEDHA LOGO - TOP */}
        <View className="items-center absolute top-16 left-0 right-0">
          <Image
            source={medha}
            style={{ width: width * 0.58, height: width * 0.28 }}
            resizeMode="contain"
          />
        </View>

        {/* Header - Above Card */}
        <View className="items-center mb-8 mt-20">
          <Text className="text-white text-[26px] font-light">Be a part of</Text>
          <Text className="text-white text-[34px] font-bold my-1">Medha Clinic</Text>
          <Text className="text-[#d6ecff] text-[14px] mt-1.5 text-center">
            Login to continue to MedhaClinic
          </Text>
        </View>

        {/* Login Card - Green Glass Effect */}
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

          <TouchableOpacity className="bg-[#ffffff] py-3.5 rounded-[20px] items-center mt-1.5">
  <Text className="text-[#16a34a] text-[24px] font-semibold">
    Login
  </Text>
</TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-[#cfe8ff] text-center mt-3">Forget Password?</Text>
          </TouchableOpacity>

          <Text className="text-[#cfe8ff] text-center my-2.5">OR</Text>

          <TouchableOpacity className="border border-[#16a34a] py-3 rounded-[30px] items-center">
            <Text className="text-[#cfe8ff] text-[15px]">login with OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link - Below Card */}
        <View className="mt-8 items-center">
          <Text className="text-white text-[15px]">
            Don't have an account?{' '}
            <Text 
              className="text-white font-bold underline"
              onPress={() => router.push('/signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}