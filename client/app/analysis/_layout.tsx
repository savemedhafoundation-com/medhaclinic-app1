import { Stack } from 'expo-router';

export default function AnalysisLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="stepanalyst" />
      <Stack.Screen name="dailydietswaps" />
    </Stack>
  );
}
