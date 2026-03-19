import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import commonimg from '../assets/images/common_bgpage.png';
import medha from '../assets/images/medha_logo.png';
import { useAuth } from '../providers/AuthProvider';
import { saveHealthProfile } from '../services/medhaDataConnect';

async function getStoredUserData() {
  try {
    const rawValue = await AsyncStorage.getItem('medha_user');

    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.log('Failed to read cached user details:', error);
    return {};
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type HeightUnit = 'cm' | 'inch';

function formatNormalizedNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function normalizeHeightToCm(value: string, unit: HeightUnit) {
  const parsedHeight = Number.parseFloat(value);

  if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
    throw new Error('Enter a valid height.');
  }

  const heightInCm = unit === 'inch' ? parsedHeight * 2.54 : parsedHeight;
  return formatNormalizedNumber(heightInCm);
}

export default function SignupScreen() {

  const { user, setNeedsProfile } = useAuth();

  const [gender, setGender] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const saveUserData = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedAge = age.trim();
    const trimmedWeight = weight.trim();
    const trimmedHeight = height.trim();
    const trimmedAddress = address.trim();
    const resolvedEmail = (email.trim() || user?.email || '').trim();
    let normalizedHeightCm = '';

    if (!trimmedFullName) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!trimmedAge) {
      Alert.alert('Error', 'Age is required');
      return;
    }

    if (!trimmedWeight) {
      Alert.alert('Error', 'Weight is required');
      return;
    }

    if (!trimmedHeight) {
      Alert.alert('Error', 'Height is required');
      return;
    }

    try {
      normalizedHeightCm = normalizeHeightToCm(trimmedHeight, heightUnit);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Enter a valid height.'
      );
      return;
    }

    if (!trimmedAddress) {
      Alert.alert('Error', 'Address is required');
      return;
    }

    if (!resolvedEmail) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    if (!isValidEmail(resolvedEmail)) {
      Alert.alert('Error', 'Enter a valid email address');
      return;
    }

    try {
      const existingUserData = await getStoredUserData();

      const userData = {
        ...existingUserData,
        fullName: trimmedFullName,
        gender,
        age: trimmedAge,
        weight: trimmedWeight,
        height: normalizedHeightCm,
        heightUnit,
        purpose,
        address: trimmedAddress,
        email: resolvedEmail,
        profileCompleted: true,
      };

      // Always persist locally first — works offline and is the source of truth
      // for the auth routing logic (hasCachedHealthProfile).
      await AsyncStorage.setItem('medha_user', JSON.stringify(userData));

      // Mark profile complete immediately so routing moves to dashboard.
      setNeedsProfile(false);

      // Sync to Firestore / DataConnect in the background — non-fatal.
      // Phone-auth users on native may have an unsynced web SDK, which is OK.
      if (user) {
        saveHealthProfile({
          fullName: trimmedFullName,
          email: resolvedEmail,
          gender,
          age: trimmedAge,
          weight: trimmedWeight,
          height: normalizedHeightCm,
          purpose,
          address: trimmedAddress,
        }).catch(error => {
          console.log('[Signup] Firestore sync note (non-fatal):', error);
        });
      }

      router.replace('/(tabs)/dashboard');

    } catch (error) {
      console.log('[Signup] Save error:', error);
      Alert.alert('Error', 'Failed to save your details. Please try again.');
    }

  };

  return (

    <ImageBackground source={commonimg} className="flex-1" resizeMode="cover">

      <LinearGradient
        colors={['rgba(33,230,46,0.35)', 'rgba(27,156,113,0.35)']}
        style={{ flex: 1 }}
      >

        <SafeAreaView style={{ flex: 1 }}>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
          >

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: 140 }}
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

              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />

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

              {/* AGE + WEIGHT */}

              <View className="flex-row gap-4 mt-5">

                <Input
                  small
                  label="Age *"
                  placeholder="Years"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />

                <Input
                  small
                  label="Weight *"
                  placeholder="Kg"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />

              </View>

              {/* HEIGHT */}

              <Text className="text-white text-[18px] font-semibold mb-2 mt-5">
                Height Unit
              </Text>

              <View className="flex-row gap-3">
                <UnitChip
                  label="cm"
                  selected={heightUnit === 'cm'}
                  onPress={() => setHeightUnit('cm')}
                />

                <UnitChip
                  label="inch"
                  selected={heightUnit === 'inch'}
                  onPress={() => setHeightUnit('inch')}
                />
              </View>

              <View className="flex-row gap-4 mt-4">

                <Input
                  small
                  label={`Height * (${heightUnit})`}
                  placeholder={heightUnit === 'cm' ? 'Enter cm' : 'Enter inches'}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />

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

              {/* ADDRESS */}

              <Input
                label="Full Address *"
                placeholder="Enter your address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />

              {/* EMAIL — pre-fill from Google if available */}

              <Input
                label="Email Address *"
                placeholder="example@gmail.com"
                value={email || user?.email || ''}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

            </View>

            {/* SAVE BUTTON */}

            <TouchableOpacity
              className="mx-5 mt-2.5 h-14 rounded-full bg-[#22c55e] items-center justify-center"
              onPress={saveUserData}
            >

              <Text className="text-white text-[20px] font-semibold">
                Save Details
              </Text>

            </TouchableOpacity>

            {/* FOOTER */}

            <Text className="text-[#D6E6FF] text-[18px] text-center mt-4 px-8">
              Your information is confidential and used only for your health guidance
            </Text>

            </ScrollView>

          </KeyboardAvoidingView>

        </SafeAreaView>

      </LinearGradient>

    </ImageBackground>

  );
}

/* ---------- INPUT COMPONENT ---------- */

function Input({
  label,
  placeholder,
  small,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  multiline,
  numberOfLines,
}: any) {

  return (

    <View style={{ flex: small ? 1 : undefined }}>

      <Text className="text-white text-[18px] font-semibold mb-2 mt-4">
        {label}
      </Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#D6E6FF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`
          rounded-[16px]
          px-4
          py-3
          bg-[rgba(255,255,255,0.25)]
          text-white
          text-[20px]
          ${multiline ? 'min-h-[110px]' : small ? 'h-12' : 'h-14'}
        `}
      />

    </View>

  );

}

/* ---------- RADIO COMPONENT ---------- */

function Radio({ text, selected, onPress }: any) {

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

function UnitChip({ label, selected, onPress }: any) {

  return (

    <TouchableOpacity
      className={`
        px-5 py-2.5 rounded-full border
        ${selected ? 'bg-[#1DA1F2] border-[#1DA1F2]' : 'bg-[rgba(255,255,255,0.12)] border-[rgba(255,255,255,0.35)]'}
      `}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <Text
        className={`${selected ? 'text-white' : 'text-[#EAF2FF]'} text-[16px] font-semibold`}
      >
        {label}
      </Text>

    </TouchableOpacity>

  );

}
