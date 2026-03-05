import { Stack } from 'expo-router';
import { View } from 'react-native';
import BottomNav from '../../components/BottomNav';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Stack MUST wrap Stack.Screen */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)/dashboard" />
        <Stack.Screen name="(tabs)/healthalert" />
        <Stack.Screen name="(tabs)/advice" />
        
      </Stack>

      {/* ✅ Bottom nav outside Stack */}
      <BottomNav />
    </View>
  );
}
