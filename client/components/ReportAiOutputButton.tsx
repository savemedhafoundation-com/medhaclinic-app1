import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../providers/AuthProvider';
import {
  reportAiOutput,
  type AiReportReason,
} from '../services/aiReport';

const REPORT_REASONS: { label: string; value: AiReportReason }[] = [
  { label: 'Unsafe health advice', value: 'unsafe_health_advice' },
  { label: 'Harmful or offensive', value: 'harmful_or_offensive' },
  { label: 'Misleading or inaccurate', value: 'misleading_or_inaccurate' },
  { label: 'Privacy concern', value: 'privacy_or_personal_data' },
  { label: 'Other concern', value: 'other' },
];

type ReportAiOutputButtonProps = {
  contentPreview: string;
  outputReference?: string | null;
  screenName: string;
};

export default function ReportAiOutputButton({
  contentPreview,
  outputReference,
  screenName,
}: ReportAiOutputButtonProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function submitReport(reasonCategory: AiReportReason) {
    try {
      setSubmitting(true);
      await reportAiOutput(
        {
          screenName,
          outputReference,
          reasonCategory,
          contentPreview: contentPreview.slice(0, 1200),
        },
        user
      );

      Alert.alert(
        'Report sent',
        'Thank you. The Medha Wellness team will review this output.'
      );
    } catch (error) {
      Alert.alert(
        'Report not sent',
        error instanceof Error
          ? error.message
          : 'Could not send this report right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openReasonPicker() {
    Alert.alert(
      'Report AI output',
      'What should the team review?',
      [
        ...REPORT_REASONS.map(reason => ({
          text: reason.label,
          onPress: () => void submitReport(reason.value),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      disabled={submitting}
      onPress={openReasonPicker}
      style={styles.button}
    >
      <View style={styles.iconWrap}>
        {submitting ? (
          <ActivityIndicator color="#7F1D1D" size="small" />
        ) : (
          <Ionicons color="#7F1D1D" name="flag-outline" size={16} />
        )}
      </View>
      <Text style={styles.text}>
        {submitting ? 'Sending report...' : 'Report unsafe content'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  iconWrap: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  text: {
    color: '#7F1D1D',
    fontSize: 13,
    fontWeight: '700',
  },
});
