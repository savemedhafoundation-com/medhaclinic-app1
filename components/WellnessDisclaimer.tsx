import { Text, View } from 'react-native';

export const WELLNESS_DISCLAIMER_TEXT =
  'This app provides general wellness and lifestyle information only. It is not a medical device and does not diagnose, treat, cure, or prevent any disease. Please consult a qualified healthcare professional for medical advice.';

type WellnessDisclaimerProps = {
  className?: string;
  textClassName?: string;
};

export default function WellnessDisclaimer({
  className = '',
  textClassName = '',
}: WellnessDisclaimerProps) {
  return (
    <View
      className={`rounded-2xl border border-[#F6D98F] bg-[#FFF8E1] px-4 py-3 ${className}`}
    >
      <Text
        className={`text-[12px] font-semibold leading-[18px] text-[#6B4E00] ${textClassName}`}
      >
        {WELLNESS_DISCLAIMER_TEXT}
      </Text>
    </View>
  );
}
