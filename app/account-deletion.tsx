import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../components/ScreenNav';
import { useAuth } from '../providers/AuthProvider';
import { goBackOrReplace } from '../services/navigation';

const SUPPORT_EMAIL = 'info@savemedha.com';
const ACCOUNT_DELETION_MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  'Medha Wellness Account Deletion Request'
)}&body=${encodeURIComponent(
  'Hello Medha Wellness team,\n\nI would like to request deletion of my account and associated personal data.\n\nRegistered phone or email:\nFull name:\nAdditional details:\n'
)}`;

const DATA_DELETION_ITEMS = [
  'Your Medha Wellness profile and saved wellness details',
  'Daily immunity submissions and generated wellness summaries',
  'Saved addresses and linked personal account data',
  'Your Medha Wellness sign-in account',
] as const;

export default function AccountDeletionScreen() {
  const { user } = useAuth();

  async function handleOpenEmailRequest() {
    try {
      await Linking.openURL(ACCOUNT_DELETION_MAILTO_URL);
    } catch (error) {
      console.log('Account deletion email open failed:', error);
      Alert.alert(
        'Email request',
        `Could not open the email app. Please email ${SUPPORT_EMAIL} from your registered contact details.`
      );
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenNav
        onBackPress={() =>
          goBackOrReplace(user ? '/(tabs)/profile' : '/Loginscreen')
        }
        title="Account Deletion"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </View>

          <Text style={styles.heroTitle}>Delete your account</Text>
          <Text style={styles.heroSubtitle}>
            Deleting your account will remove your profile, wellness records,
            saved addresses, and linked personal data, subject to legal
            retention requirements.
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>What gets deleted</Text>

          <View style={styles.infoCard}>
            {DATA_DELETION_ITEMS.map(item => (
              <View key={item} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Retention notice</Text>

          <View style={styles.noticeCard}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#B45309"
            />
            <Text style={styles.noticeText}>
              If a narrow legal or transaction-retention obligation applies, we
              will retain only the minimum records required and restrict access
              to them.
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Web request option</Text>

          <View style={styles.infoCard}>
            <Text style={styles.bodyText}>
              If you cannot access the app, you can still request deletion
              through this web resource by emailing Medha Wellness support from
              your registered email address or with your registered phone number.
            </Text>

            <Text style={styles.supportText}>
              Support email: {SUPPORT_EMAIL}
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => void handleOpenEmailRequest()}
              style={styles.secondaryButton}
            >
              <Ionicons name="mail-outline" size={18} color="#14532D" />
              <Text style={styles.secondaryButtonText}>
                Email Deletion Request
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.helperText}>
          Send the request from your registered contact details so support can
          verify and process account deletion.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: 'rgba(127, 29, 29, 0.24)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  sectionBlock: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: '#334155',
  },
  noticeCard: {
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#92400E',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    color: '#475569',
  },
  supportText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14532D',
  },
  secondaryButton: {
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14532D',
  },
  helperText: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
});
