import { Stack } from "expo-router";
import "../global.css";
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
      <Stack.Screen name="index" />
      <Stack.Screen name="Loginscreen" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="dietscreen" />
      <Stack.Screen name="foodpreferance"/>
      <Stack.Screen name="healthassessment"/>
      <Stack.Screen name="process"/>
      <Stack.Screen name="assessmentcertification"/>
      <Stack.Screen name="dashboard"/>
      <Stack.Screen name="certification/daily"/>
      <Stack.Screen name="immunity/dailyimmunity"/>

          </Stack>
  );
}
