import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../providers/AuthProvider';
import {
  getCurrentUserData,
  getLatestDailyImmunitySummary,
  type LatestDailyImmunitySummary,
  saveHealthProfile,
} from '../services/medhaDataConnect';
import { uploadCurrentUserProfilePhoto } from '../services/profilePhoto';

type StoredUser = {
  fullName?: string;
  email?: string;
  phone?: string;
  lastLogin?: string;
  gender?: string | null;
  age?: string;
  weight?: string;
  height?: string;
  heightUnit?: HeightUnit;
  purpose?: string | null;
  address?: string;
  photoURL?: string | null;
};

type RemoteUser = {
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  lastLoginAt?: string | null;
  profile?: {
    gender?: string | null;
    age?: number;
    weightKg?: number;
    heightCm?: number;
    purpose?: string | null;
    address?: string | null;
  } | null;
};

type ActionCardItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
};

type HeightUnit = 'cm' | 'foot';
type EditorMode = 'email' | 'details';

type ProfileEditorForm = {
  email: string;
  gender: string | null;
  age: string;
  weight: string;
  height: string;
  heightUnit: HeightUnit;
};

const profileImage = require('../assets/images/profile.png');
const GENDER_OPTIONS = ['Male', 'Female', 'Others'] as const;
const HEIGHT_UNIT_OPTIONS: HeightUnit[] = ['cm', 'foot'];

function parseNumber(value?: string | number | null) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeRemoteUser(user: unknown): RemoteUser | null {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const userRecord = user as Record<string, unknown>;
  const rawProfile = userRecord.profile;
  const profileRecord =
    rawProfile && typeof rawProfile === 'object'
      ? (rawProfile as Record<string, unknown>)
      : null;

  return {
    name: readString(userRecord.name),
    email: readString(userRecord.email),
    photoUrl: readString(userRecord.photoUrl),
    lastLoginAt: readString(userRecord.lastLoginAt),
    profile: profileRecord
      ? {
          gender: readString(profileRecord.gender),
          age: readNumber(profileRecord.age),
          weightKg: readNumber(profileRecord.weightKg),
          heightCm: readNumber(profileRecord.heightCm),
          purpose: readString(profileRecord.purpose),
          address: readString(profileRecord.address),
        }
      : null,
  };
}

function formatLastLogin(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return 'Today';
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (sameDay) {
    return `Today, ${timeLabel}`;
  }

  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${dateLabel}, ${timeLabel}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatNormalizedNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function normalizeHeightToCm(value: string, unit: HeightUnit) {
  const parsedHeight = Number.parseFloat(value);

  if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
    throw new Error('Enter a valid height.');
  }

  const heightInCm = unit === 'foot' ? parsedHeight * 30.48 : parsedHeight;
  return formatNormalizedNumber(heightInCm);
}

function convertHeightFromCm(value?: number, unit: HeightUnit = 'cm') {
  if (value === undefined) {
    return '';
  }

  const convertedHeight = unit === 'foot' ? value / 30.48 : value;
  return formatNormalizedNumber(convertedHeight);
}

function convertHeightBetweenUnits(
  value: string,
  fromUnit: HeightUnit,
  toUnit: HeightUnit
) {
  if (!value.trim() || fromUnit === toUnit) {
    return value;
  }

  const parsedHeight = Number.parseFloat(value);

  if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
    return value;
  }

  const heightInCm = fromUnit === 'foot' ? parsedHeight * 30.48 : parsedHeight;
  const convertedHeight = toUnit === 'foot' ? heightInCm / 30.48 : heightInCm;

  return formatNormalizedNumber(convertedHeight);
}

function getGenderLabel(gender?: string | null) {
  if (!gender) {
    return '--';
  }

  const normalized = gender.trim().toLowerCase();

  if (normalized.startsWith('m')) {
    return 'Male';
  }

  if (normalized.startsWith('f')) {
    return 'Female';
  }

  return 'Other';
}

function normalizeImmunityLevelLabel(value?: string | null) {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
    default:
      return null;
  }
}

function getLatestImmunityMeta(latestImmunity: LatestDailyImmunitySummary | null) {
  if (typeof latestImmunity?.immunityScore !== 'number') {
    return {
      score: '--',
      status: 'Pending',
      note: 'Complete a daily immunity check to see your latest score.',
    };
  }

  const normalizedLevel = normalizeImmunityLevelLabel(latestImmunity.immunityLevel);
  const score = latestImmunity.immunityScore;
  const derivedLevel =
    score >= 8.2
      ? 'Excellent'
      : score >= 6.8
        ? 'Good'
        : score >= 5.2
          ? 'Moderate'
          : 'Low';

  return {
    score: String(score),
    status: normalizedLevel ?? derivedLevel,
    note: latestImmunity.submittedAt
      ? `Last updated ${formatLastLogin(latestImmunity.submittedAt)}`
      : 'Based on your latest daily immunity check.',
  };
}

function calculateBmi(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) {
    return {
      score: '--',
      status: 'Update',
      note: 'Add your weight and height to see your BMI.',
    };
  }

  const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

  if (!Number.isFinite(bmi)) {
    return {
      score: '--',
      status: 'Update',
      note: 'Add your weight and height to see your BMI.',
    };
  }

  if (bmi < 18.5) {
    return {
      score: bmi.toFixed(1),
      status: 'Low',
      note: 'Calculated from your saved height and weight.',
    };
  }

  if (bmi < 25) {
    return {
      score: bmi.toFixed(1),
      status: 'Balanced',
      note: 'Calculated from your saved height and weight.',
    };
  }

  if (bmi < 30) {
    return {
      score: bmi.toFixed(1),
      status: 'Moderate',
      note: 'Calculated from your saved height and weight.',
    };
  }

  return {
    score: bmi.toFixed(1),
    status: 'High',
    note: 'Calculated from your saved height and weight.',
  };
}

function calculateDailyCalories(input: {
  gender?: string | null;
  age?: number;
  weightKg?: number;
  heightCm?: number;
}) {
  const { gender, age, weightKg, heightCm } = input;

  if (!age || !weightKg || !heightCm) {
    return undefined;
  }

  const normalizedGender = gender?.trim().toLowerCase() ?? '';
  const genderAdjustment = normalizedGender.startsWith('m')
    ? 5
    : normalizedGender.startsWith('f')
      ? -161
      : -78;

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderAdjustment;
  const recommendedCalories = Math.round((bmr * 1.35) / 50) * 50;

  return Number.isFinite(recommendedCalories)
    ? Math.max(1200, recommendedCalories)
    : undefined;
}

function formatMetric(value?: number, unit?: string) {
  if (value === undefined) {
    return {
      value: '--',
      unit: undefined,
    };
  }

  const rounded =
    Number.isInteger(value) || unit === 'cm' ? String(value) : value.toFixed(1);

  return {
    value: rounded,
    unit,
  };
}

function getNutritionSubtitle(purpose?: string | null) {
  if (!purpose) {
    return 'Recommended intake';
  }

  if (purpose === 'concern') {
    return 'Wellness support nutrition';
  }

  if (purpose === 'preventive') {
    return 'Preventive wellness target';
  }

  return 'Recommended intake';
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
  const [latestImmunity, setLatestImmunity] =
    useState<LatestDailyImmunitySummary | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('details');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editorForm, setEditorForm] = useState<ProfileEditorForm>({
    email: '',
    gender: null,
    age: '',
    weight: '',
    height: '',
    heightUnit: 'cm',
  });

  useEffect(() => {
    let active = true;

    async function loadProfileData() {
      try {
        const rawUser = await AsyncStorage.getItem('medha_user');

        if (rawUser && active) {
          setStoredUser(JSON.parse(rawUser) as StoredUser);
        }
      } catch (error) {
        console.log('Failed to load local profile details:', error);
      }

      try {
        const currentUserData = await getCurrentUserData();

        if (active) {
          setRemoteUser(normalizeRemoteUser(currentUserData?.user));
        }
      } catch (error) {
        console.log('Failed to load remote profile details:', error);
      }

      try {
        const latestDailyImmunity = await getLatestDailyImmunitySummary();

        if (active) {
          setLatestImmunity(latestDailyImmunity);
        }
      } catch (error) {
        console.log('Failed to load latest daily immunity score:', error);
      }
    }

    void loadProfileData();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      router.replace('/Loginscreen');
    } catch (error) {
      console.log('Logout failed:', error);
      Alert.alert('Logout failed', 'Please try again.');
    }
  }

  async function persistUploadedPhoto(photoUrl: string) {
    let nextStoredUser: StoredUser = {
      ...(storedUser ?? {}),
      photoURL: photoUrl,
    };

    try {
      const rawUser = await AsyncStorage.getItem('medha_user');

      if (rawUser) {
        const parsed = JSON.parse(rawUser) as unknown;

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          nextStoredUser = {
            ...(parsed as StoredUser),
            ...nextStoredUser,
            photoURL: photoUrl,
          };
        }
      }

      await AsyncStorage.setItem('medha_user', JSON.stringify(nextStoredUser));
    } catch (error) {
      console.log('Failed to cache uploaded photo locally:', error);
    }

    setStoredUser(nextStoredUser);
    setRemoteUser(previous => ({
      ...(previous ?? {}),
      photoUrl,
    }));
  }

  async function handleEditPhoto() {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again before changing your photo.');
      return;
    }

    try {
      setPhotoBusy(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Allow photo library access to upload a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const photoUrl = await uploadCurrentUserProfilePhoto(result.assets[0], user);
      await persistUploadedPhoto(photoUrl);

      Alert.alert('Profile photo updated', 'Your new profile photo has been saved.');
    } catch (error) {
      console.log('Profile photo upload failed:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Could not upload your profile photo. Please try again.';
      Alert.alert('Upload failed', message);
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleSupport() {
    router.push('/support');
  }

  function handleAbout() {
    router.push('/about');
  }

  function handlePrivacyPolicy() {
    router.push('/(tabs)/privacy-policy');
  }

  const actionItems: ActionCardItem[] = [
    {
      key: 'support',
      title: 'Wellness Support',
      subtitle: 'Get support for your wellness routine',
      icon: 'help-circle-outline',
      iconColor: '#2563EB',
      iconBackground: '#EFF6FF',
      onPress: handleSupport,
    },
    {
      key: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: 'shield-checkmark-outline',
      iconColor: '#16A34A',
      iconBackground: '#F0FDF4',
      onPress: handlePrivacyPolicy,
    },
    {
      key: 'about',
      title: 'About MedhaClinic',
      subtitle: 'Restoring life naturally',
      icon: 'information-circle-outline',
      iconColor: '#9333EA',
      iconBackground: '#F5F3FF',
      onPress: handleAbout,
    },
  ];

  // Priority: user-entered local fullName → remote name → Firebase profile.name.
  // Local fullName is preferred because it is the exact value entered in signup,
  // while remote auth-derived names can briefly lag behind on native sync paths.
  const displayName =
    storedUser?.fullName?.trim() ||
    remoteUser?.name?.trim() ||
    profile?.name ||
    'MedhaClinic User';
  const savedEmail =
    remoteUser?.email?.trim() ||
    profile?.email?.trim() ||
    storedUser?.email?.trim() ||
    '';
  const displayEmail = savedEmail || 'Add your email';
  const hasSavedEmail = Boolean(savedEmail);
  const displayPhoto =
    remoteUser?.photoUrl || profile?.photoURL || storedUser?.photoURL || null;
  const lastLoginLabel = formatLastLogin(
    remoteUser?.lastLoginAt || storedUser?.lastLogin
  );

  const gender = remoteUser?.profile?.gender ?? storedUser?.gender;
  const age = parseNumber(remoteUser?.profile?.age ?? storedUser?.age);
  const weightKg = parseNumber(
    remoteUser?.profile?.weightKg ?? storedUser?.weight
  );
  const heightCm = parseNumber(
    remoteUser?.profile?.heightCm ?? storedUser?.height
  );
  const preferredHeightUnit: HeightUnit =
    storedUser?.heightUnit === 'cm' ? 'cm' : 'foot';
  const purpose = remoteUser?.profile?.purpose ?? storedUser?.purpose;
  const address = remoteUser?.profile?.address ?? storedUser?.address;

  const latestImmunityMeta = getLatestImmunityMeta(latestImmunity);
  const bmiMeta = calculateBmi(weightKg, heightCm);
  const dailyCalories = calculateDailyCalories({
    gender,
    age,
    weightKg,
    heightCm,
  });
  const weightMetric = formatMetric(weightKg, 'kg');
  const heightMetric = formatMetric(
    parseNumber(convertHeightFromCm(heightCm, preferredHeightUnit)),
    preferredHeightUnit === 'foot' ? 'ft' : 'cm'
  );

  function handleUpdateMetrics() {
    setEditorMode('details');
    setEditorForm({
      email: savedEmail,
      gender: gender ?? null,
      age: age !== undefined ? String(age) : '',
      weight: weightKg !== undefined ? String(weightKg) : '',
      height: convertHeightFromCm(heightCm, preferredHeightUnit),
      heightUnit: preferredHeightUnit,
    });
    setEditorVisible(true);
  }

  function handleEditEmail() {
    setEditorMode('email');
    setEditorForm({
      email: savedEmail,
      gender: gender ?? null,
      age: age !== undefined ? String(age) : '',
      weight: weightKg !== undefined ? String(weightKg) : '',
      height: convertHeightFromCm(heightCm, preferredHeightUnit),
      heightUnit: preferredHeightUnit,
    });
    setEditorVisible(true);
  }

  function closeEditor() {
    if (savingProfile) {
      return;
    }

    setEditorVisible(false);
  }

  async function handleSaveProfileDetails() {
    const emailOnlyMode = editorMode === 'email';
    const trimmedEmail = editorForm.email.trim();
    const trimmedAge = emailOnlyMode ? '' : editorForm.age.trim();
    const trimmedWeight = emailOnlyMode ? '' : editorForm.weight.trim();
    const trimmedHeight = emailOnlyMode ? '' : editorForm.height.trim();

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    if (emailOnlyMode && !trimmedEmail) {
      Alert.alert('Email required', 'Enter an email address to continue.');
      return;
    }

    const parsedAge = trimmedAge ? Number.parseInt(trimmedAge, 10) : age;
    if (
      trimmedAge &&
      (!Number.isInteger(parsedAge) || !parsedAge || parsedAge <= 0 || parsedAge > 120)
    ) {
      Alert.alert('Invalid age', 'Enter a valid age between 1 and 120.');
      return;
    }

    const parsedWeight = trimmedWeight ? Number.parseFloat(trimmedWeight) : weightKg;
    if (
      trimmedWeight &&
      (!Number.isFinite(parsedWeight) || !parsedWeight || parsedWeight <= 0 || parsedWeight > 500)
    ) {
      Alert.alert('Invalid weight', 'Enter a valid weight in kilograms.');
      return;
    }

    let normalizedHeightCm = heightCm !== undefined ? String(heightCm) : undefined;
    let parsedHeight = heightCm;

    if (trimmedHeight) {
      try {
        normalizedHeightCm = normalizeHeightToCm(trimmedHeight, editorForm.heightUnit);
        parsedHeight = Number.parseFloat(normalizedHeightCm);
      } catch (error) {
        Alert.alert(
          'Invalid height',
          error instanceof Error ? error.message : 'Enter a valid height.'
        );
        return;
      }
    }

    const nextEmail = trimmedEmail || savedEmail || undefined;
    const nextGender = editorForm.gender ?? gender ?? undefined;
    const nextAge = parsedAge !== undefined ? String(parsedAge) : undefined;
    const nextWeight = parsedWeight !== undefined ? String(parsedWeight) : undefined;
    const nextHeight = normalizedHeightCm;
    const nextHeightUnit = editorForm.heightUnit;

    try {
      setSavingProfile(true);

      await saveHealthProfile({
        fullName: displayName,
        email: nextEmail,
        gender: nextGender ?? null,
        age: nextAge,
        weight: nextWeight,
        height: nextHeight,
        purpose,
        address,
      });

      const nextStoredUser: StoredUser = {
        ...(storedUser ?? {}),
        fullName: displayName,
        email: nextEmail,
        phone: storedUser?.phone,
        lastLogin: storedUser?.lastLogin,
        gender: nextGender ?? null,
        age: nextAge,
        weight: nextWeight,
        height: nextHeight,
        heightUnit: nextHeightUnit,
        purpose,
        address,
        photoURL: displayPhoto,
      };

      await AsyncStorage.setItem('medha_user', JSON.stringify(nextStoredUser));

      setStoredUser(nextStoredUser);
      setRemoteUser(previous => ({
        ...(previous ?? {}),
        name: displayName,
        email: nextEmail ?? null,
        photoUrl: displayPhoto,
        lastLoginAt: previous?.lastLoginAt ?? null,
        profile: {
          ...(previous?.profile ?? {}),
          gender: nextGender ?? null,
          age: parsedAge,
          weightKg: parsedWeight,
          heightCm: parsedHeight,
          purpose: purpose ?? null,
          address: address ?? null,
        },
      }));

      setEditorVisible(false);
      Alert.alert('Profile updated', 'Your profile details have been saved.');
    } catch (error) {
      console.log('Profile details update failed:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Could not save your profile details. Please try again.';
      Alert.alert('Update failed', message);
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerCard}>
            <View style={styles.profileBlock}>
              <TouchableOpacity
                activeOpacity={photoBusy ? 1 : 0.9}
                disabled={photoBusy}
                onPress={() => void handleEditPhoto()}
                style={styles.avatarTouch}
              >
                <LinearGradient
                  colors={['#4ADE80', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarRing}
                >
                  <Image
                    source={displayPhoto ? { uri: displayPhoto } : profileImage}
                    resizeMode="cover"
                    style={styles.avatarImage}
                  />
                </LinearGradient>

                <View style={styles.cameraBadge}>
                  {photoBusy ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <Ionicons name="camera-outline" size={16} color="#334155" />
                  )}
                </View>
              </TouchableOpacity>

              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleEditEmail}
                style={styles.addEmailButton}
              >
                <Ionicons name="mail-outline" size={14} color="#16A34A" />
                <Text style={styles.addEmailButtonText}>
                  {hasSavedEmail ? 'Update Email' : 'Add Email'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                {photoBusy ? 'Uploading photo...' : 'Tap photo to update'}
              </Text>

              <View style={styles.lastLoginBadge}>
                <Ionicons name="time-outline" size={14} color="#94A3B8" />
                <Text style={styles.lastLoginText}>
                  Last login: {lastLoginLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Immunity Score</Text>
          </View>

          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bmiCard}
          >
            <View style={styles.bmiGlowTop} />
            <View style={styles.bmiGlowBottom} />

            <View style={styles.bmiRow}>
              <View style={styles.bmiCopy}>
                <Text style={styles.bmiLabel}>Current Score</Text>

                <View style={styles.bmiValueRow}>
                  <Text style={styles.bmiValue}>{latestImmunityMeta.score}</Text>
                  <View style={styles.bmiBadge}>
                    <Text style={styles.bmiBadgeText}>{latestImmunityMeta.status}</Text>
                  </View>
                </View>

                <Text style={styles.bmiNote}>{latestImmunityMeta.note}</Text>
              </View>

              <View style={styles.bmiIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Mass Index</Text>
          </View>

          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bmiCard}
          >
            <View style={styles.bmiGlowTop} />
            <View style={styles.bmiGlowBottom} />

            <View style={styles.bmiRow}>
              <View style={styles.bmiCopy}>
                <Text style={styles.bmiLabel}>Current Score</Text>

                <View style={styles.bmiValueRow}>
                  <Text style={styles.bmiValue}>{bmiMeta.score}</Text>
                  <View style={styles.bmiBadge}>
                    <Text style={styles.bmiBadgeText}>{bmiMeta.status}</Text>
                  </View>
                </View>

                <Text style={styles.bmiNote}>{bmiMeta.note}</Text>
              </View>

              <View style={styles.bmiIconWrap}>
                <Ionicons name="pulse-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateMetrics}
              style={styles.sectionAction}
            >
              <Text style={styles.sectionActionText}>Edit Details</Text>
              <Ionicons name="chevron-forward" size={14} color="#16A34A" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <StatCard label="Age" value={age ? String(age) : '--'} />
            <StatCard label="Gender" value={getGenderLabel(gender)} />
            <StatCard
              label="Weight"
              value={weightMetric.value}
              unit={weightMetric.unit}
            />
            <StatCard
              label="Height"
              value={heightMetric.value}
              unit={heightMetric.unit}
            />
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Nutrition Plan</Text>

            <View style={styles.nutritionCard}>
              <View style={styles.nutritionIconWrap}>
                <Ionicons name="flame-outline" size={24} color="#F97316" />
              </View>

              <View style={styles.nutritionCopy}>
                <Text style={styles.nutritionTitle}>Daily Target</Text>
                <Text style={styles.nutritionSubtitle}>
                  {getNutritionSubtitle(purpose)}
                </Text>
              </View>

              <View style={styles.nutritionValueWrap}>
                <Text style={styles.nutritionValue}>
                  {dailyCalories ? dailyCalories.toLocaleString('en-US') : '--'}
                </Text>
                <Text style={styles.nutritionUnit}>Kcal / Day</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>General</Text>

            <View style={styles.actionListCard}>
              {actionItems.map((item, index) => (
                <View key={item.key}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={item.onPress}
                    style={styles.actionRow}
                  >
                    <View
                      style={[
                        styles.actionIconWrap,
                        { backgroundColor: item.iconBackground },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={item.iconColor}
                      />
                    </View>

                    <View style={styles.actionCopy}>
                      <Text style={styles.actionTitle}>{item.title}</Text>
                      <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#CBD5E1"
                    />
                  </TouchableOpacity>

                  {index < actionItems.length - 1 ? (
                    <View style={styles.actionDivider} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => void handleLogout()}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent
        visible={editorVisible}
        onRequestClose={closeEditor}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeEditor} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboardWrap}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <Text style={styles.modalTitle}>
                    {editorMode === 'email' ? 'Update Email' : 'Edit Details'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {editorMode === 'email'
                      ? 'Add or update your email address only.'
                      : 'Update your gender, age, weight, and height in cm or foot.'}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={savingProfile}
                  onPress={closeEditor}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={18} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalContent}
              >
                {editorMode === 'email' ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onChangeText={value =>
                        setEditorForm(previous => ({
                          ...previous,
                          email: value,
                        }))
                      }
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      value={editorForm.email}
                    />
                  </View>
                ) : null}

                {editorMode === 'details' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Gender</Text>
                      <View style={styles.genderOptionsRow}>
                        {GENDER_OPTIONS.map(option => {
                          const selected = editorForm.gender === option;

                          return (
                            <TouchableOpacity
                              key={option}
                              activeOpacity={0.85}
                              onPress={() =>
                                setEditorForm(previous => ({
                                  ...previous,
                                  gender: option,
                                }))
                              }
                              style={[
                                styles.genderOption,
                                selected && styles.genderOptionSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.genderOptionText,
                                  selected && styles.genderOptionTextSelected,
                                ]}
                              >
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, styles.inputHalf]}>
                        <Text style={styles.inputLabel}>Age</Text>
                        <TextInput
                          keyboardType="number-pad"
                          onChangeText={value =>
                            setEditorForm(previous => ({
                              ...previous,
                              age: value.replace(/[^0-9]/g, ''),
                            }))
                          }
                          placeholder="Years"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                          value={editorForm.age}
                        />
                      </View>

                      <View style={[styles.inputGroup, styles.inputHalf]}>
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <TextInput
                          keyboardType="decimal-pad"
                          onChangeText={value =>
                            setEditorForm(previous => ({
                              ...previous,
                              weight: value.replace(/[^0-9.]/g, ''),
                            }))
                          }
                          placeholder="Enter kg"
                          placeholderTextColor="#94A3B8"
                          style={styles.input}
                          value={editorForm.weight}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>
                          Height ({editorForm.heightUnit === 'foot' ? 'foot' : 'cm'})
                        </Text>

                        <View style={styles.heightUnitRow}>
                          {HEIGHT_UNIT_OPTIONS.map(option => {
                            const selected = editorForm.heightUnit === option;

                            return (
                              <TouchableOpacity
                                key={option}
                                activeOpacity={0.85}
                                onPress={() =>
                                  setEditorForm(previous => ({
                                    ...previous,
                                    height: convertHeightBetweenUnits(
                                      previous.height,
                                      previous.heightUnit,
                                      option
                                    ),
                                    heightUnit: option,
                                  }))
                                }
                                style={[
                                  styles.heightUnitOption,
                                  selected && styles.heightUnitOptionSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.heightUnitOptionText,
                                    selected && styles.heightUnitOptionTextSelected,
                                  ]}
                                >
                                  {option === 'foot' ? 'Foot' : 'CM'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={value =>
                          setEditorForm(previous => ({
                            ...previous,
                            height: value.replace(/[^0-9.]/g, ''),
                          }))
                        }
                        placeholder={
                          editorForm.heightUnit === 'foot' ? 'Enter feet' : 'Enter cm'
                        }
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        value={editorForm.height}
                      />
                    </View>
                  </>
                ) : null}
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.88}
                disabled={savingProfile}
                onPress={() => void handleSaveProfileDetails()}
                style={[
                  styles.saveButton,
                  savingProfile && styles.saveButtonDisabled,
                ]}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>
                      {editorMode === 'email' ? 'Save Email' : 'Save Changes'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>

      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 190,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: 'rgba(15, 23, 42, 0.16)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#16A34A',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#0F172A',
  },
  profileBlock: {
    alignItems: 'center',
  },
  avatarTouch: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 102,
    height: 102,
    borderRadius: 51,
    padding: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: '#0F172A',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  addEmailButton: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addEmailButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  photoHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 8,
    textAlign: 'center',
  },
  lastLoginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 14,
  },
  lastLoginText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionBlock: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#0F172A',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginRight: 2,
  },
  bmiCard: {
    marginHorizontal: 24,
    borderRadius: 30,
    padding: 24,
    overflow: 'hidden',
  },
  bmiGlowTop: {
    position: 'absolute',
    top: -24,
    right: -8,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bmiGlowBottom: {
    position: 'absolute',
    left: -18,
    bottom: -36,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bmiCopy: {
    flex: 1,
    paddingRight: 16,
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(240, 253, 244, 0.92)',
    marginBottom: 10,
  },
  bmiValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  bmiValue: {
    fontSize: 50,
    lineHeight: 54,
    fontWeight: '700',
    letterSpacing: -1.3,
    color: '#FFFFFF',
  },
  bmiBadge: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
    marginBottom: 6,
  },
  bmiBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bmiNote: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(240, 253, 244, 0.9)',
    marginTop: 12,
    lineHeight: 19,
  },
  bmiIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 2,
    marginBottom: 2,
  },
  nutritionCard: {
    marginTop: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  nutritionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nutritionCopy: {
    flex: 1,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  nutritionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  nutritionValueWrap: {
    alignItems: 'flex-end',
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: '#0F172A',
  },
  nutritionUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  actionListCard: {
    marginTop: 12,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 70,
    marginRight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalKeyboardWrap: {
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
    maxHeight: '82%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitleWrap: {
    flex: 1,
    paddingRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE6F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  genderOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE6F0',
    backgroundColor: '#F8FAFC',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderOptionSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  genderOptionTextSelected: {
    color: '#15803D',
  },
  heightUnitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heightUnitOption: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DCE6F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heightUnitOptionSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  heightUnitOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  heightUnitOptionTextSelected: {
    color: '#15803D',
  },
  saveButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 10,
  },
});
