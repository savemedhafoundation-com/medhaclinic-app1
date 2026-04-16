import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { goBackOrReplace } from '../../services/navigation';

type PolicyGroup = {
  title?: string;
  paragraphs?: string[];
  items?: string[];
};

type PolicySection = {
  key: string;
  title: string;
  paragraphs?: string[];
  groups?: PolicyGroup[];
};

const privacyHeroImage = require('../../assets/images/privacy-policy-hero.jpg');

const POLICY_SECTIONS: PolicySection[] = [
  {
    key: 'scope',
    title: 'Scope of Policy',
    paragraphs: [
      'This Privacy Policy applies to all users of the Medha Clinic platform, including patients, caregivers, and visitors accessing our Services.',
      'By accessing or using our Services, you agree to the terms of this Privacy Policy and consent to the collection and use of your information as described herein.',
    ],
  },
  {
    key: 'information',
    title: 'Information We Collect',
    paragraphs: [
      'We collect only the information necessary to provide healthcare services effectively.',
    ],
    groups: [
      {
        items: [
          'Full name',
          'Phone number',
          'Email address',
          'Date of birth / age',
          'Gender',
          'Address',
        ],
      },
      {
        title: 'As defined under the SPDI Rules, this includes:',
        items: [
          'Medical history and health conditions',
          'Symptoms and diagnoses',
          'Prescriptions and treatment records',
          'Diagnostic reports and lab results',
          'Consultation notes',
        ],
      },
      {
        title: 'Technical & Usage Information',
        items: [
          'Device information, including device type and OS version',
          'IP address and log data',
          'App usage patterns and interaction data',
        ],
      },
      {
        title: 'Appointment & Transaction Data',
        items: [
          'Appointment bookings and history',
          'Doctor preferences',
          'Payment details processed via secure third-party gateways',
        ],
      },
    ],
  },
  {
    key: 'purpose',
    title: 'Purpose of Data Collection',
    paragraphs: [
      'We use your information to deliver and improve Medha Clinic services in a safe and reliable manner.',
    ],
    groups: [
      {
        items: [
          'Provide healthcare consultations, nutrition support, and wellness recommendations',
          'Maintain your account, health profile, reports, and service history',
          'Schedule appointments and respond to support requests',
          'Send important service updates, reminders, and safety notices',
          'Improve app performance, security, and patient experience',
        ],
      },
    ],
  },
  {
    key: 'sharing',
    title: 'Data Sharing and Disclosure',
    paragraphs: [
      'We do not sell your personal or health information. We may share information only when it is needed to provide Services, comply with law, or protect users and the platform.',
      'This may include sharing with authorized doctors, healthcare staff, technical service providers, payment partners, or government authorities when required by applicable law.',
    ],
  },
  {
    key: 'security',
    title: 'Data Security',
    paragraphs: [
      'We use reasonable security practices to protect personal and sensitive health information from unauthorized access, misuse, disclosure, alteration, or destruction.',
      'Access to sensitive information is limited to authorized personnel and service providers who need it to perform their duties.',
    ],
  },
  {
    key: 'retention',
    title: 'Data Retention',
    paragraphs: [
      'We retain your information only for as long as necessary to provide Services, meet legal requirements, resolve disputes, and maintain accurate medical or transaction records.',
      'When information is no longer required, we may delete, anonymize, or securely archive it as permitted by law.',
    ],
  },
  {
    key: 'rights',
    title: 'User Rights',
    paragraphs: [
      'You may request access, correction, update, or deletion of your personal information, subject to applicable law and medical record requirements.',
      'You may also withdraw consent for optional communications where available, while understanding that some information is necessary to continue providing healthcare services.',
    ],
  },
  {
    key: 'cookies',
    title: 'Cookies & Tracking System',
    paragraphs: [
      'Our website and app may use cookies, log data, and similar technologies to support sessions, security, performance, analytics, and service improvements.',
      'You may disable browser cookies through your device or browser settings, but some features may not work properly without them.',
    ],
  },
  {
    key: 'changes',
    title: 'Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. Updates will be posted in the app or on the Medha Clinic website with a revised update date.',
      'Continued use of the Services after an update means you accept the revised Privacy Policy.',
    ],
  },
  {
    key: 'grievance',
    title: 'Grievance Officer',
    paragraphs: [
      'For privacy concerns, data requests, or complaints, contact Medha Clinic support at info@savemedha.com or through Patient Support in the app.',
    ],
  },
];

const DEFAULT_OPEN_SECTIONS = {
  scope: true,
  information: true,
} as Record<string, boolean>;

export default function PrivacyPolicyScreen() {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

  function toggleSection(key: string) {
    setOpenSections(previous => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScreenNav
        onBackPress={() => goBackOrReplace('/(tabs)/profile')}
        title="Privacy Policy"
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          resizeMode="cover"
          source={privacyHeroImage}
          style={styles.hero}
        >
          <View style={styles.heroOverlay} />
        </ImageBackground>

        <View style={styles.policyBody}>
          <Text style={styles.pageTitle}>Privacy Policy</Text>
          <Text style={styles.updatedText}>Updated 05 May, 2025</Text>

          <Text style={styles.introText}>
            Medha Clinic is committed to protecting the privacy and security of
            your personal and health information. This Privacy Policy describes
            how we collect, use, disclose, store, and protect your information
            when you access or use the Medha Clinic mobile application,
            website, and related services, collectively called the Services.
          </Text>

          <Text style={styles.introText}>
            This policy is prepared in accordance with the Information
            Technology Act, 2000, the Information Technology Reasonable Security
            Practices and Procedures and Sensitive Personal Data or Information
            Rules, 2011, and other applicable Indian laws.
          </Text>

          <View style={styles.sectionList}>
            {POLICY_SECTIONS.map(section => (
              <PolicySectionItem
                key={section.key}
                expanded={Boolean(openSections[section.key])}
                section={section}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PolicySectionItem({
  expanded,
  onToggle,
  section,
}: {
  expanded: boolean;
  onToggle: () => void;
  section: PolicySection;
}) {
  return (
    <View style={styles.policySection}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onToggle}
        style={styles.policySectionHeader}
      >
        <Text style={styles.policySectionTitle}>{section.title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          color="#111111"
          size={24}
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.policySectionBody}>
          {section.paragraphs?.map(paragraph => (
            <Text key={paragraph} style={styles.bodyText}>
              {paragraph}
            </Text>
          ))}

          {section.groups?.map(group => (
            <View
              key={group.title ?? group.items?.join('|')}
              style={styles.groupBlock}
            >
              {group.title ? (
                <Text style={styles.groupTitle}>{group.title}</Text>
              ) : null}

              {group.paragraphs?.map(paragraph => (
                <Text key={paragraph} style={styles.bodyText}>
                  {paragraph}
                </Text>
              ))}

              {group.items?.map(item => (
                <View key={item} style={styles.bulletRow}>
                  <Text style={styles.bulletMarker}>-</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 180,
  },
  hero: {
    minHeight: 250,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 46,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 9, 18, 0.5)',
  },
  backButton: {
    position: 'absolute',
    left: 18,
    top: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  policyBody: {
    paddingHorizontal: 30,
    paddingTop: 48,
  },
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#0B0B0F',
  },
  updatedText: {
    marginTop: 24,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  introText: {
    marginTop: 34,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
    color: '#101010',
  },
  sectionList: {
    marginTop: 50,
  },
  policySection: {
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  policySectionHeader: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 18,
  },
  policySectionTitle: {
    flex: 1,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    color: '#111111',
  },
  policySectionBody: {
    paddingBottom: 30,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '400',
    color: '#101010',
    marginBottom: 18,
  },
  groupBlock: {
    marginTop: 16,
  },
  groupTitle: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    color: '#101010',
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    paddingLeft: 10,
  },
  bulletMarker: {
    width: 14,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    color: '#101010',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: '#101010',
  },
});
