import { Stack } from "expo-router";
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
      <Stack.Screen name="basicscreens" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="information" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="certification" />
      <Stack.Screen name="immunity/dailyimmunity" />
      <Stack.Screen name="immunity/weeklyimmunity" />
      <Stack.Screen name="immunity/Immunity _results" />
    </Stack>
  );
}
