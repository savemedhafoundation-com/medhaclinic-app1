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

/* ---------- MAIN SCREEN ---------- */
import commonimg from '../../assets/images/common_bgpage.png';
import medha from '../../assets/images/medha_logo.png';

export default function SignupScreen() {
  const [gender, setGender] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);

  return (
    <ImageBackground source={commonimg} className="flex-1" resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,90,160,0.55)', 'rgba(0,40,90,0.55)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* LOGO */}
            <View className="items-center mt-5">
              <Image
                source={medha}
                className="w-[180px] h-[60px]"
                resizeMode="contain"
              />
              <Text className="text-[#EAF2FF] text-[13px] mt-1">Restoring Life Naturally</Text>
            </View>

            <Text className="text-white text-[22px] font-semibold mt-[30px] ml-5">
              Basic Information
            </Text>

            {/* FORM CARD */}
            <View className="m-5 p-5 rounded-[22px] bg-[rgba(255,255,255,0.14)] border border-[rgba(255,255,255,0.25)]">
              <Input label="Full Name" placeholder="Enter your full name" />

              <Text className="text-white text-[14px] mb-1.5 mt-3">Gender</Text>
              <View className="flex-row gap-[18px]">
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

              <View className="flex-row gap-3">
                <Input small label="Age" placeholder="Years" />
                <Input small label="Weight" placeholder="Kg" />
              </View>

              <Text className="text-white text-[14px] mb-1.5 mt-3">
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

              <Input label="Full Address" placeholder="Select one" />
              <Input label="Email Address" placeholder="example@gmail.com" />
              <Input label="Mobile Number" placeholder="+91 Phone number" />
              <Input label="OTP Verification" placeholder="Enter OTP" />
            </View>

            {/* CTA */}
           <TouchableOpacity
             className="mx-5 mt-2.5 h-14 rounded-full bg-[#1DA1F2] items-center justify-center"
             onPress={() => router.push('/(tabs)/dashboard')}>
             <Text className="text-white text-[16px] font-semibold">
               Save Details
             </Text>
           </TouchableOpacity>

            {/* FOOTER */}
            <Text className="text-[#D6E6FF] text-[12px] text-center mt-2 px-[30px]">
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
      <Text className="text-white text-[14px] mb-1.5 mt-3">{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#D6E6FF"
        className={`rounded-[14px] px-4 bg-[rgba(255,255,255,0.25)] text-white text-[15px] ${small ? 'h-11' : 'h-12'}`}
      />
    </View>
  );
}

/* ---------- RADIO COMPONENT ---------- */

function Radio({ text, selected, onPress }: RadioProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center my-1.5"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        className={`w-[18px] h-[18px] rounded-[9px] border-2 items-center justify-center mr-2 ${selected ? 'border-[#1DA1F2]' : 'border-white'}`}
      >
        {selected && <View className="w-2 h-2 rounded-full bg-[#1DA1F2]" />}
      </View>
      <Text className="text-white text-[14px]">{text}</Text>
    </TouchableOpacity>
  );
}
