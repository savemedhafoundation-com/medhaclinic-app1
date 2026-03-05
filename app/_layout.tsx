import { Stack } from "expo-router";
import "../global.css";
import { StackScreen } from "react-native-screens";
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
      <Stack.Screen name="report/weeklyreport"/>
      <Stack.Screen name="process"/>
       <Stack.Screen name="advice"/>
       <Stack.Screen name="immunity"/>
      <Stack.Screen name="assessment/certificate"/>
      <Stack.Screen name="dashboard"/>
      <Stack.Screen name="boosterdiet/dietplan"/>
      <Stack.Screen name="boosterdiet/boosterplan"/>
      <Stack.Screen name="analysis/stepanalyst"/>
      <Stack.Screen name="certification/daily"/>
      <Stack.Screen name="immunity/dailyimmunity"/>

          </Stack>
  );
}
