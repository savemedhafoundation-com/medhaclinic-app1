import { Stack } from 'expo-router';

export default function HomeScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="basicscreens" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="information" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
