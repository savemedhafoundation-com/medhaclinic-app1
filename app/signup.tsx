import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ---------- TYPES ---------- */

type InputProps = {
  label: string;
  placeholder: string;
  small?: boolean;
};

type RadioProps = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

/* ---------- ASSETS ---------- */

import commonimg from '../assets/images/common_bgpage.png';
import medha from '../assets/images/medha_logo.png';

/* ---------- MAIN SCREEN ---------- */

export default function SignupScreen() {
  const [gender, setGender] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);

  return (
    <ImageBackground source={commonimg} className="flex-1" resizeMode="cover">
      <LinearGradient
        colors={['rgba(33,230,46,0.35)', 'rgba(27,156,113,0.35)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* LOGO */}
            <View className="items-center mt-5">
              <Image
                source={medha}
                className="w-[180px] h-[60px]"
                resizeMode="contain"
              />
              <Text className="text-[#EAF2FF] text-[15px] mt-1">
                Restoring Life Naturally
              </Text>
            </View>

            {/* TITLE */}
            <Text className="text-white text-[24px] font-bold mt-8 ml-5">
              Basic Information
            </Text>

            {/* FORM CARD */}
            <View className="m-5 p-5 rounded-[24px] bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.25)]">
              
              <Input label="Full Name" placeholder="Enter your full name" />

              {/* GENDER */}
              <Text className="text-white text-[18px] font-semibold mb-2 mt-5">
                Gender
              </Text>
              <View className="flex-row gap-5">
                <Radio
                  text="Male"
                  selected={gender === 'Male'}
                  onPress={() => setGender('Male')}
                />
                <Radio
                  text="Female"
                  selected={gender === 'Female'}
                  onPress={() => setGender('Female')}
                />
                <Radio
                  text="Others"
                  selected={gender === 'Others'}
                  onPress={() => setGender('Others')}
                />
              </View>

              {/* AGE / WEIGHT */}
              <View className="flex-row gap-4 mt-5">
                <Input small label="Age" placeholder="Years" />
                <Input small label="Weight" placeholder="Kg" />
              </View>
     <View className="flex-row gap-4 mt-5">
                <Input small label="Height" placeholder="in cm" />
              </View>
              {/* PURPOSE */}
              <Text className="text-white text-[18px] font-semibold mb-2 mt-5">
                Purpose of assessment
              </Text>
              <Radio
                text="I have health concern"
                selected={purpose === 'concern'}
                onPress={() => setPurpose('concern')}
              />
              <Radio
                text="General health check / Preventive assessment"
                selected={purpose === 'preventive'}
                onPress={() => setPurpose('preventive')}
              />

              {/* OTHER INPUTS */}
              <Input label="Full Address" placeholder="Enter your address" />
              <Input label="Email Address" placeholder="example@gmail.com" />
              <Input label="Mobile Number" placeholder="+91 Phone number" />
              <Input label="OTP Verification" placeholder="Enter OTP" />
            </View>

            {/* CTA */}
            <TouchableOpacity className="mx-5 mt-2.5 h-14 rounded-full bg-[#22c55e] items-center justify-center"
              onPress={() => router.push('/(tabs)/dashboard')}
            >
              <Text className="text-white text-[20px] font-semibold">
                Save Details
              </Text>
            </TouchableOpacity>

            {/* FOOTER */}
            <Text className="text-[#D6E6FF] text-[18px] text-center mt-4 px-8">
              Your information is confidential and used only for your health
              guidance
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

/* ---------- INPUT COMPONENT ---------- */

function Input({ label, placeholder, small }: InputProps) {
  return (
    <View style={{ flex: small ? 1 : undefined }}>
      <Text className="text-white text-[18px] font-semibold mb-2 mt-4">
        {label}
      </Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#D6E6FF"
        className={`
          rounded-[16px]
          px-4
          bg-[rgba(255,255,255,0.25)]
          text-white
          text-[20px]
          ${small ? 'h-12' : 'h-14'}
        `}
      />
    </View>
  );
}

/* ---------- RADIO COMPONENT ---------- */

function Radio({ text, selected, onPress }: RadioProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center my-2"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        className={`
          w-[22px] h-[22px] rounded-[11px] border-2
          items-center justify-center mr-3
          ${selected ? 'border-[#1DA1F2]' : 'border-white'}
        `}
      >
        {selected && (
          <View className="w-3 h-3 rounded-full bg-[#1DA1F2]" />
        )}
      </View>

      <Text className="text-white text-[18px]">
        {text}
      </Text>
    </TouchableOpacity>
  );
}
