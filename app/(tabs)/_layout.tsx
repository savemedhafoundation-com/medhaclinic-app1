import { Stack } from 'expo-router';
import { View } from 'react-native';
import BottomNav from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Stack MUST wrap Stack.Screen */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="healthalert" />
        <Stack.Screen name="advice" />
        
      </Stack>

      {/* ✅ Bottom nav outside Stack */}
      <BottomNav />
    </View>
  );
}
