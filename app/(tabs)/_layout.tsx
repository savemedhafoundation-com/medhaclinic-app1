import { Stack } from 'expo-router';
import { View } from 'react-native';

import BottomNav from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="healthalert" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="reports" />
      </Stack>

      <BottomNav />
    </View>
  );
}
