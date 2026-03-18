import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../providers/AuthProvider';
import { getCurrentUserData } from '../services/medhaDataConnect';

type StoredUser = {
  fullName?: string;
  email?: string;
  phone?: string;
  lastLogin?: string;
  gender?: string | null;
  age?: string;
  weight?: string;
  height?: string;
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

const profileImage = require('../assets/images/profile.png');

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

function getSexLabel(gender?: string | null) {
  if (!gender) {
    return '--';
  }

  const normalized = gender.trim().toLowerCase();

  if (normalized.startsWith('m')) {
    return 'M';
  }

  if (normalized.startsWith('f')) {
    return 'F';
  }

  return 'O';
}

function calculateBmi(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm) {
    return {
      score: '--',
      status: 'Update',
    };
  }

  const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

  if (!Number.isFinite(bmi)) {
    return {
      score: '--',
      status: 'Update',
    };
  }

  if (bmi < 18.5) {
    return {
      score: bmi.toFixed(1),
      status: 'Low',
    };
  }

  if (bmi < 25) {
    return {
      score: bmi.toFixed(1),
      status: 'Healthy',
    };
  }

  if (bmi < 30) {
    return {
      score: bmi.toFixed(1),
      status: 'Moderate',
    };
  }

  return {
    score: bmi.toFixed(1),
    status: 'High',
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
    return 'Condition support nutrition';
  }

  if (purpose === 'preventive') {
    return 'Preventive wellness target';
  }

  return 'Recommended intake';
}

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);

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

  function handleBack() {
    router.replace('/(tabs)/dashboard');
  }

  function handleSettings() {
    Alert.alert('Settings', 'Settings options will be added next.');
  }
  function handleEditPhoto() {
    Alert.alert('Profile Photo', 'Photo editing will be added next.');
  }

  function handleSupport() {
    Alert.alert(
      'Patient Support',
      'Support options will be added next.'
    );
  }

  function handleAbout() {
    router.push('/about');
  }

  function handleUpdateMetrics() {
    router.push('/signup');
  }

  const actionItems: ActionCardItem[] = [
    {
      key: 'support',
      title: 'Patient Support',
      subtitle: 'Get help with your treatment',
      icon: 'help-circle-outline',
      iconColor: '#2563EB',
      iconBackground: '#EFF6FF',
      onPress: handleSupport,
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

  const displayName =
    remoteUser?.name?.trim() ||
    profile?.name ||
    storedUser?.fullName?.trim() ||
    'MedhaClinic User';
  const displayEmail =
    remoteUser?.email?.trim() ||
    profile?.email ||
    storedUser?.email?.trim() ||
    storedUser?.phone?.trim() ||
    'Add your email';
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
  const purpose = remoteUser?.profile?.purpose ?? storedUser?.purpose;

  const bmi = calculateBmi(weightKg, heightCm);
  const dailyCalories = calculateDailyCalories({
    gender,
    age,
    weightKg,
    heightCm,
  });
  const weightMetric = formatMetric(weightKg, 'kg');
  const heightMetric = formatMetric(heightCm, 'cm');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleBack}
                style={styles.circleButton}
              >
                <Ionicons name="chevron-back" size={20} color="#475569" />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.brandLabel}>MedhaClinic</Text>
                <Text style={styles.headerTitle}>My Profile</Text>
              </View>

              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.profileBlock}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleEditPhoto}
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
                  <Ionicons name="camera-outline" size={16} color="#334155" />
                </View>
              </TouchableOpacity>

              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>

              <View style={styles.lastLoginBadge}>
                <Ionicons name="time-outline" size={14} color="#94A3B8" />
                <Text style={styles.lastLoginText}>
                  Last login: {lastLoginLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Mass Index</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateMetrics}
              style={styles.sectionAction}
            >
              <Text style={styles.sectionActionText}>Update</Text>
              <Ionicons name="chevron-forward" size={14} color="#16A34A" />
            </TouchableOpacity>
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
                  <Text style={styles.bmiValue}>{bmi.score}</Text>
                  <View style={styles.bmiBadge}>
                    <Text style={styles.bmiBadgeText}>{bmi.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bmiIconWrap}>
                <Ionicons name="pulse-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsGrid}>
            <StatCard label="Age" value={age ? String(age) : '--'} />
            <StatCard label="Sex" value={getSexLabel(gender)} />
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
