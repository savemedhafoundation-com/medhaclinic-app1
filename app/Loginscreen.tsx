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
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import backgroundimg from '../assets/images/common_bgpage.png';
import medha from '../assets/images/medha_logo.png';
import googleLogo from '../assets/images/google.png';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {

  // ✅ 1️⃣ Google Hook MUST be inside component
  const [request, response, promptAsync] = Google.useAuthRequest({
   androidClientId: '357939272957-4ubgpt119siq7krhtmg884a5hr1rg4f3.apps.googleusercontent.com',

      webClientId: '357939272957-iq3fatrek0v90f01uva7ic2803ciqshj.apps.googleusercontent.com',  });


  // ✅ 2️⃣ useEffect must come AFTER hook
  useEffect(() => {     

    
    if (response?.type !== 'success') return;

    const authentication = response.authentication;
    if (!authentication?.accessToken) return;

    getUserInfo(authentication.accessToken);

  }, [response]);

  // ✅ 3️⃣ Function AFTER hooks
  async function getUserInfo(token: string) {
    try {
      const res = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
console.log('Android Client ID:', '357939272957-4ubgpt119siq7krhtmg884a5hr1rg4f3.apps.googleusercontent.com');

      const user = await res.json();
      console.log(user);

      router.replace('/(tabs)/dashboard');

    } catch (error) {
      Alert.alert('Login failed', 'Unable to fetch Google user info.');
    }
  }

  // ✅ 4️⃣ UI
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
          <TouchableOpacity
             onPress={() => promptAsync({ })}
            disabled={!request}
            className="bg-white py-3 rounded-full flex-row items-center 
            justify-center mt-5 shadow-sm"
          >
            <Image
              source={googleLogo}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            <Text className="text-black text-base font-medium ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

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
