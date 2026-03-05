import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import backgroundimg from '../assets/images/common_bgpage.png';
import medha from '../assets/images/medha_logo.png';
import googleLogo from '../assets/images/google.png';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId:
  //       '720727109835-5gdvd5th5pkt9hsl8a6925d9erv1hufg.apps.googleusercontent.com',
  //   });
  // }, []);

  // async function handleGoogleSignIn() {
  //   try {
  //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  //     const signInResult = await GoogleSignin.signIn();
  //     if (!isSuccessResponse(signInResult)) return;

  //     router.replace('/(tabs)/dashboard');
  //   } catch (error) {
  //     if (isErrorWithCode(error)) {
  //       if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
  //       if (error.code === statusCodes.IN_PROGRESS) return;
  //       if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //         Alert.alert('Google Play Services required');
  //         return;
  //       }
  //     }
  //     Alert.alert('Login failed', 'Unable to sign in with Google.');
  //   }
  // }

  return (
    <ImageBackground
      source={backgroundimg}
      className="flex-1"
      resizeMode="cover"
    >
      <LinearGradient
        colors={['#21E9461A', '#1B9C711A']}
        className="flex-1 px-6 justify-center"
      >
        {/* Logo */}
        <View className="items-center absolute top-16 left-0 right-0">
          <Image
            source={medha}
            style={{ width: width * 0.58, height: width * 0.28 }}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View className="items-center mb-8 mt-20">
          <Text className="text-white text-2xl font-light">
            Be a part of
          </Text>
          <Text className="text-white text-3xl font-bold my-1">
            Medha Clinic
          </Text>
          <Text className="text-[#d6ecff] text-sm mt-2 text-center">
            Login to continue to MedhaClinic
          </Text>
        </View>

        {/* Login Card */}
        <View className="bg-[rgba(255,255,255,0.12)] rounded-[24px] p-6">
          <TextInput
            placeholder="Phone number or Email"
            placeholderTextColor="#cfe8ff"
            className="bg-[rgba(255,255,255,0.15)] rounded-full px-5 py-3 text-white mb-4"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#cfe8ff"
            secureTextEntry
            className="bg-[rgba(255,255,255,0.15)] rounded-full px-5 py-3 text-white mb-4"
          />

          <TouchableOpacity className="bg-white py-3.5 rounded-[20px] items-center">
            <Text className="text-[#16a34a] text-lg font-semibold">
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-[#cfe8ff] text-center mt-4">
              Forget Password?
            </Text>
          </TouchableOpacity>

          {/* Google Sign In */}
     

          <Text className="text-[#cfe8ff] text-center my-4">OR</Text>

          <TouchableOpacity className="border border-[#16a34a] py-3 rounded-full items-center">
            <Text className="text-[#cfe8ff] text-sm">
              Login with OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View className="mt-8 items-center">
          <Text className="text-white text-sm">
            Don't have an account?{' '}
            <Text
              className="text-white font-semibold underline"
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