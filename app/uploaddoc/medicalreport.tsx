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
            Medical Reports
          </Text>

          <Text className="text-center text-[16px] mb-1">
            Your immunity assessment score is below 8.
          </Text>

          <Text className="text-center text-[15px] text-gray-700 mb-4">
            For detailed guidance, please upload relevant medical reports.
          </Text>

          <Text className="text-center text-[14px] text-gray-500 mb-8">
            (Reports help to provide personalized, accurate advice)
          </Text>

          {/* Upload title */}
          <Text className="text-[20px] font-bold text-[#166534] mb-2">
            Upload Reports <Text className="text-red-500 text-[16px]">(Required)</Text>
          </Text>

          <Text className="text-gray-700 mb-6">
            Please upload recent medical reports so our doctor can review them.
          </Text>

          {/* Blood Test */}
          <ReportCard
            icon="water"
            iconColor="#991b1b"
            title="Blood Test"
            subtitle="CBC, LFT & IgE Test Reports"
            required
          />

          {/* Scan */}
          <ReportCard
            icon="scan"
            iconColor="#2563eb"
            title="Scanned X-Ray"
            subtitle="MRI, CT Scan"
          />

          {/* Others */}
          <ReportCard
            icon="document-text"
            iconColor="#065f46"
            title="Others"
            subtitle="Prescription, treatment history etc"
          />

          {/* Submit */}
          <TouchableOpacity className="bg-[#22c55e] py-4 rounded-full items-center mb-6">
            <Text className="text-white text-[18px] font-bold">
              Submit Reports
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[14px] text-gray-600 mb-3">
            Having issues?{' '}
            <Text className="text-[#16a34a] font-semibold">
              Contact Support
            </Text>
          </Text>

          <Text className="text-center text-[13px] text-gray-500 leading-5">
            Reports are confidential and used only for your health guidance.
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
