import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {/* Auth / Welcome screens */}
//       <Stack.Screen name="Loginscreen" />
//       <Stack.Screen name="signup" />
//       <Stack.Screen name="index" />
//      <Stack.Screen name="dashboard" />
//  {/* Main App */}
//     </Stack>
//   );
// }
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="reports" />
    </Stack>
  );
}
