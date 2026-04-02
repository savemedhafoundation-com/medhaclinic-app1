import React from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

const logo = require('../../assets/images/medha_logo.png');
const bgImage = require('../../assets/images/dashbg.png');

type IconName = keyof typeof Ionicons.glyphMap;
type DashboardRoute = '/homescreen/basicscreens' | '/analysis/stepanalyst' | '/(tabs)/profile';

type ActionItem = {
  title: string;
  description: string;
  icon: IconName;
  route: DashboardRoute;
};

type DisclaimerItem = {
  title: string;
  icon: IconName;
  accent: string;
};

const actionItems: ActionItem[] = [
  {
    title: 'Basic Health Assessment',
    description: "Tell us about your body, lifestyle, and how you're feeling.",
    icon: 'document-text-outline',
    route: '/homescreen/basicscreens',
  },
  {
    title: 'Moderate Health Assessment',
    description: 'Understand your current health status with a detailed mid-level assessment.',
    icon: 'fitness-outline',
    route: '/homescreen/basicscreens',
  },
  {
    title: 'Critical Health Assessment',
    description: 'An advanced evaluation for urgent health concerns and high-risk conditions.',
    icon: 'medkit-outline',
    route: '/homescreen/basicscreens',
  },
  {
    title: 'What is Natural Immunotherapy',
    description: 'Learn how healing through natural immunity works.',
    icon: 'leaf-outline',
    route: '/analysis/stepanalyst',
  },
];

const disclaimerItems: DisclaimerItem[] = [
  {
    title: 'Replace emergency treatment',
    icon: 'close-circle',
    accent: '#f97316',
  },
  {
    title: 'Promise instant cure',
    icon: 'flash-off',
    accent: '#2dd4bf',
  },
  {
    title: 'Use fear-based language',
    icon: 'chatbubble-ellipses',
    accent: '#c084fc',
  },
  {
    title: 'Fake promises',
    icon: 'shield-checkmark',
    accent: '#60a5fa',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.background}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['rgba(12, 112, 12, 0.84)', 'rgba(10, 94, 11, 0.9)', 'rgba(8, 72, 12, 0.96)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Image source={logo} resizeMode="contain" style={styles.logo} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 132 },
          ]}>
          <View style={styles.heroBlock}>
            <Text numberOfLines={1} style={styles.eyebrow}>
              Welcome to
            </Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.heroTitle}>
              Medha Clinic
            </Text>
            <Text style={styles.heroDescription}>
              We are here to understand your body and guide recovery naturally
            </Text>
          </View>

          <Text style={styles.sectionTitle}>What would you like to do today?</Text>

          <View style={styles.cardsColumn}>
            {actionItems.map(item => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.92}
                onPress={() => router.push(item.route)}
                style={styles.cardTouch}>
                <LinearGradient
                  colors={['rgba(29, 185, 28, 0.98)', 'rgba(14, 158, 18, 0.98)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCard}>
                  <View style={styles.actionIconShell}>
                    <Ionicons name={item.icon} size={22} color="#ffffff" />
                  </View>

                  <View style={styles.actionBody}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionDescription}>{item.description}</Text>
                  </View>

                  <View style={styles.arrowShell}>
                    <Ionicons name="chevron-forward" size={18} color="#ffffff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>What This App Does NOT Do</Text>

            <View style={styles.disclaimerGrid}>
              {disclaimerItems.map(item => (
                <View key={item.title} style={styles.disclaimerItem}>
                  <View style={[styles.disclaimerIcon, { backgroundColor: item.accent }]}>
                    <Ionicons name={item.icon} size={12} color="#ffffff" />
                  </View>
                  <Text style={styles.disclaimerText}>{item.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0c6e0d',
  },
  safeArea: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(133, 255, 97, 0.12)',
  },
  glowTop: {
    top: -48,
    right: -26,
    width: 150,
    height: 150,
  },
  glowBottom: {
    left: -36,
    bottom: 118,
    width: 180,
    height: 180,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  logo: {
    width: 168,
    height: 78,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  heroBlock: {
    marginTop: 6,
    marginBottom: 22,
    paddingRight: 8,
    alignItems: 'center',
  },
  eyebrow: {
    color: '#f6fff0',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '300',
    textAlign: 'center',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  heroDescription: {
    marginTop: 14,
    color: 'rgba(236, 255, 232, 0.94)',
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 265,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#f3ffe9',
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  cardsColumn: {
    gap: 14,
  },
  cardTouch: {
    borderRadius: 26,
  },
  actionCard: {
    minHeight: 66,
    borderRadius: 26,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#083f0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  actionIconShell: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    marginRight: 12,
  },
  actionBody: {
    flex: 1,
    paddingRight: 12,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '700',
  },
  actionDescription: {
    marginTop: 3,
    color: 'rgba(240, 255, 239, 0.92)',
    fontSize: 12,
    lineHeight: 15,
  },
  arrowShell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 255, 53, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  disclaimerCard: {
    marginTop: 28,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(9, 52, 13, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disclaimerTitle: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: 14,
  },
  disclaimerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  disclaimerItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 8,
  },
  disclaimerText: {
    flex: 1,
    color: 'rgba(243, 255, 240, 0.94)',
    fontSize: 13,
    lineHeight: 17,
  },
});
