import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  Platform,
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
import { goBackOrReplace } from '../services/navigation';

const CLINIC_PHONE_NUMBER = '+91 9800808595';
const CLINIC_DIALER_URL = 'tel:+919800808595';
const SUPPORT_EMAIL = 'info@savemedha.com';
const GMAIL_COMPOSE_URL = `googlegmail://co?to=${encodeURIComponent(SUPPORT_EMAIL)}`;
const MAILTO_URL = `mailto:${SUPPORT_EMAIL}`;

async function openClinicDialer() {
  try {
    await Linking.openURL(CLINIC_DIALER_URL);
  } catch (error) {
    console.log('Dialer open failed:', error);
    Alert.alert(
      'Call Clinic',
      `Could not open the dialer. Please call ${CLINIC_PHONE_NUMBER}.`
    );
  }
}

async function openSupportEmail() {
  try {
    if (Platform.OS === 'ios') {
      try {
        await Linking.openURL(GMAIL_COMPOSE_URL);
        return;
      } catch (gmailError) {
        console.log(
          'Gmail compose open failed, falling back to the default mail app:',
          gmailError
        );
      }
    }

    await Linking.openURL(MAILTO_URL);
  } catch (error) {
    console.log('Email app open failed:', error);
    Alert.alert(
      'Email Support',
      `Could not open the email app. Please email ${SUPPORT_EMAIL}.`
    );
  }
}

const CONTACT_OPTIONS = [
  {
    key: 'chat',
    title: 'Live Chat Support',
    subtitle: 'Connect with a health advisor',
    icon: 'chatbubble-ellipses-outline',
    iconColor: '#2FB36E',
    iconBackground: '#EAFBF1',
    onPress: () =>
      Alert.alert(
        'Live Chat Support',
        'Live chat support will be available here soon.'
      ),
  },
  {
    key: 'call',
    title: 'Call Clinic',
    subtitle: 'Available Mon-Sat, 9am-5pm',
    icon: 'call-outline',
    iconColor: '#4D6CFA',
    iconBackground: '#EEF2FF',
    onPress: openClinicDialer,
  },
  {
    key: 'email',
    title: 'Email Us',
    subtitle: 'Expect a reply within 24h',
    icon: 'mail-outline',
    iconColor: '#F28B36',
    iconBackground: '#FFF2E7',
    onPress: openSupportEmail,
  },
] as const;

const QUESTIONS = [
  {
    key: 'measurements',
    title: 'How do I update my body measurements?',
    description:
      'You can update your current weight, height, and recalculate your BMI directly from the main profile page under the Body Mass Index section.',
  },
  {
    key: 'nutrition',
    title: 'Can I change my daily nutrition target?',
    description:
      'Your recommended intake is set by your healthcare provider. To request an adjustment, please reach out via Live Chat or during your next consultation.',
  },
] as const;

export default function SupportScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenNav
        onBackPress={() => goBackOrReplace('/(tabs)/profile')}
        title="Patient Support"
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSubtitle}>
              We are here to support your health journey
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Get in touch</Text>

          <View style={styles.contactCard}>
            {CONTACT_OPTIONS.map((item, index) => (
              <View key={item.key}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={item.onPress}
                  style={styles.contactRow}
                >
                  <View
                    style={[
                      styles.contactIconWrap,
                      { backgroundColor: item.iconBackground },
                    ]}
                  >
                    <Ionicons
                      color={item.iconColor}
                      name={item.icon}
                      size={20}
                    />
                  </View>

                  <View style={styles.contactCopy}>
                    <Text style={styles.contactTitle}>{item.title}</Text>
                    <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Ionicons
                    color="#7F867E"
                    name="chevron-forward"
                    size={18}
                  />
                </TouchableOpacity>

                {index < CONTACT_OPTIONS.length - 1 ? (
                  <View style={styles.contactDivider} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Common Questions</Text>

          {QUESTIONS.map(item => (
            <View key={item.key} style={styles.questionCard}>
              <Text style={styles.questionTitle}>{item.title}</Text>
              <Text style={styles.questionDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          Medha Clinic Support - Your Partner in Health
        </Text>
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
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#169300',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 34,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FFF7',
  },
  headerSpacer: {
    width: 28,
    height: 28,
  },
  heroCopy: {
    alignItems: 'center',
    marginTop: 46,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 12,
    maxWidth: 180,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#E7FBE3',
    textAlign: 'center',
  },
  sectionBlock: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#262B26',
    marginBottom: 12,
  },
  contactCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#D7DDD1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contactIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactCopy: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A25',
  },
  contactSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#858D84',
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#ECEEE8',
    marginLeft: 54,
  },
  questionCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#D7DDD1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#2A2E29',
  },
  questionDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#7A8279',
  },
  footerText: {
    marginTop: 14,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#7A8279',
    textAlign: 'center',
  },
});
