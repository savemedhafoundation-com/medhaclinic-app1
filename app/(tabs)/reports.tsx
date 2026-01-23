import { Text, View } from "react-native";

export default function ReportsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-lg font-semibold text-slate-800">Reports</Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        Upload and view your medical reports here.
      </Text>
    </View>
  );
}
