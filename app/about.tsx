import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../components/ScreenNav';
import { goBackOrReplace } from '../services/navigation';

const leaderImage = require('../assets/images/Mask group.png');

const STATS = [
  {
    key: 'experts',
    value: '20+',
    label: 'Active Patients',
  },
  {
    key: 'members',
    value: '550',
    label: 'Members',
  },
  {
    key: 'rating',
    value: '4.9',
    label: 'Average Rating',
  },
  {
    key: 'support',
    value: '24/7',
    label: 'Support Access',
  },
] as const;

const CORE_VALUES = [
  {
    key: 'patient-first',
    icon: 'heart-outline',
    iconColor: '#6D5EF5',
    iconBackground: '#F1EEFF',
    title: 'Patient First',
    description:
      "Every decision we make starts with what leads to our patients' well-being.",
  },
  {
    key: 'trust',
    icon: 'shield-checkmark-outline',
    iconColor: '#2FB36E',
    iconBackground: '#EAFBF1',
    title: 'Radical Trust',
    description:
      'We protect your health data with the highest security and responsibility standards.',
  },
  {
    key: 'innovation',
    icon: 'sparkles-outline',
    iconColor: '#D28743',
    iconBackground: '#FFF1E4',
    title: 'Continuous Innovation',
    description:
      'We constantly evolve our platform to deliver smarter, more accessible care.',
  },
] as const;

export default function AboutScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenNav
        onBackPress={() => goBackOrReplace('/(tabs)/profile')}
        title="About Medha Clinic"
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Healthcare, engineered for you.</Text>
          <Text style={styles.heroSubtitle}>
            We are a team of medical experts, and designers building the future
            of proactive primary care.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {STATS.map(item => (
            <View key={item.key} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Our Mission</Text>

          <View style={styles.missionCard}>
            <View style={styles.missionIconWrap}>
              <Ionicons name="sparkles-outline" color="#FFFFFF" size={16} />
            </View>

            <Text style={styles.missionText}>
              To democratize access to world-class healthcare by blending
              empathetic medical expertise with cutting-edge technology,
              ensuring everyone can live a healthier, longer life.
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Core Values</Text>

          <View style={styles.valuesCard}>
            {CORE_VALUES.map((item, index) => (
              <View key={item.key}>
                <View style={styles.valueRow}>
                  <View
                    style={[
                      styles.valueIconWrap,
                      { backgroundColor: item.iconBackground },
                    ]}
                  >
                    <Ionicons
                      color={item.iconColor}
                      name={item.icon}
                      size={18}
                    />
                  </View>

                  <View style={styles.valueCopy}>
                    <Text style={styles.valueTitle}>{item.title}</Text>
                    <Text style={styles.valueDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                {index < CORE_VALUES.length - 1 ? (
                  <View style={styles.valueDivider} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Leadership</Text>

          <View style={styles.leaderCard}>
            <View style={styles.leaderRow}>
              <Image source={leaderImage} style={styles.leaderImage} />

              <View style={styles.leaderCopy}>
                <Text style={styles.leaderName}>Mr. Subhankar Sarkar</Text>
                <Text style={styles.leaderRole}>
                  Founder & Chief Researcher of MedhaClinic
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.hqCard}>
          <Text style={styles.hqTitle}>MedhaClinic HQ</Text>
          <Text style={styles.hqAddress}>
            Govt Colony, Raghunathganj,{'\n'}West Bengal - 742225, Murshidabad
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8F2',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2A2E29',
  },
  headerSpacer: {
    width: 30,
    height: 30,
  },
  heroBlock: {
    marginTop: 26,
  },
  heroTitle: {
    maxWidth: 220,
    fontSize: 33,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#202320',
  },
  heroSubtitle: {
    maxWidth: 260,
    marginTop: 14,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#5B615B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 24,
  },
  statCard: {
    width: '48.2%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 16,
    shadowColor: '#D7DDD1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  statValue: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '700',
    color: '#2BB500',
  },
  statLabel: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#7B8279',
  },
  sectionBlock: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2E29',
    marginBottom: 12,
  },
  missionCard: {
    borderRadius: 18,
    backgroundColor: '#24BC00',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  missionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionText: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    color: '#F7FFF4',
  },
  valuesCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#D7DDD1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  valueIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  valueCopy: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262B26',
  },
  valueDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#7A8279',
  },
  valueDivider: {
    height: 1,
    backgroundColor: '#EEF0EA',
    marginLeft: 46,
  },
  leaderCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#D7DDD1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E4E8E0',
    marginRight: 12,
  },
  leaderCopy: {
    flex: 1,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242824',
  },
  leaderRole: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#7A8279',
  },
  hqCard: {
    marginTop: 26,
    borderRadius: 18,
    backgroundColor: '#24BC00',
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
  },
  hqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hqAddress: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#F3FFF0',
    textAlign: 'center',
  },
});
