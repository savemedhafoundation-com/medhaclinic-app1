import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { goBackOrReplace } from '../../services/navigation';

export default function MedicalReportsScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['left', 'right', 'bottom']}
    >
      {/* ================= HEADER ================= */}
      <ScreenNav onBackPress={() => goBackOrReplace('/(tabs)/dashboard')} />

      {/* ================= SCROLL CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
          paddingHorizontal: 20,
          paddingBottom: 120,
          flexGrow: 1,
        }}
      >
        <View>
          <Text className="text-[#166534] text-[28px] font-bold text-center mb-4">
            Wellness Records
          </Text>

          <Text className="text-center text-[16px] mb-1">
            Your immunity assessment score is below 8.
          </Text>

          <Text className="text-center text-[15px] text-gray-700 mb-4">
            For more personalized wellness ideas, add any relevant records you
            want the care team to review.
          </Text>

          <Text className="text-center text-[14px] text-gray-500 mb-8">
            (Records help us tailor general wellness support)
          </Text>

          {/* Upload title */}
          <Text className="text-[20px] font-bold text-[#166534] mb-2">
            Add Wellness Records <Text className="text-red-500 text-[16px]">(Optional)</Text>
          </Text>

          <Text className="text-gray-700 mb-6">
            Add recent wellness records if you would like the care team to review
            them.
          </Text>

          {/* Blood Test */}
          <ReportCard
            icon="water"
            iconColor="#991b1b"
            title="Lab Records"
            subtitle="CBC, LFT & IgE records"
          />

          {/* Scan */}
          <ReportCard
            icon="scan"
            iconColor="#2563eb"
            title="Imaging Records"
            subtitle="Imaging files, if available"
          />

          {/* Others */}
          <ReportCard
            icon="document-text"
            iconColor="#065f46"
            title="Others"
            subtitle="Current routine or past wellness notes"
          />

          {/* Submit */}
          <TouchableOpacity className="bg-[#22c55e] py-4 rounded-full items-center mb-6">
            <Text className="text-white text-[18px] font-bold">
              Submit Wellness Records
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[14px] text-gray-600 mb-3">
            Having issues?{' '}
            <Text className="text-[#16a34a] font-semibold">
              Contact Support
            </Text>
          </Text>

          <Text className="text-center text-[13px] text-gray-500 leading-5">
            Records are confidential and used only for your wellness guidance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= REUSABLE CARD ================= */

function ReportCard({
  icon,
  iconColor,
  title,
  subtitle,
  required,
}: {
  icon: any;
  iconColor: string;
  title: string;
  subtitle: string;
  required?: boolean;
}) {
  return (
    <View className="bg-[#1fa21f] rounded-[26px] p-4 flex-row items-center mb-4">
      <View className="bg-white p-3 rounded-full mr-4">
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text className="text-white text-[18px] font-bold">
          {title}{' '}
          {required && <Text className="text-[14px]">(required)</Text>}
        </Text>
        <Text className="text-white/80 text-[13px] mt-1">
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity className="bg-green-700 px-4 py-2 rounded-full">
        <Text className="text-white text-[13px]">Browse File</Text>
      </TouchableOpacity>
    </View>
  );
}
