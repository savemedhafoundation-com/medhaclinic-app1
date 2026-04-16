import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import WelcomeScreen from '../components/WelcomeScreen';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { CartProvider } from '../providers/CartProvider';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { loading, user, needsProfile } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const firstSegment = segments[0];
    const onLoginScreen = firstSegment === 'Loginscreen';
    const onSignupScreen = firstSegment === 'signup';
    const onWelcomeScreen = typeof firstSegment === 'undefined';

    // Logged-out users can stay on the welcome screen and reach login via swipe.
    if (!user && !onLoginScreen && !onWelcomeScreen) {
      router.replace('/Loginscreen');
      return;
    }

    // Logged in but health profile not completed -> force to signup
    if (user && needsProfile && !onSignupScreen) {
      router.replace('/signup');
      return;
    }

    // Logged-in users should not stay on the welcome/login/signup flow.
    if (user && !needsProfile && (onWelcomeScreen || onLoginScreen || onSignupScreen)) {
      router.replace('/(tabs)/dashboard');
    }
  }, [loading, router, segments, user, needsProfile]);

  if (loading) {
    return <WelcomeScreen allowStart={false} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Loginscreen" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="dietscreen" />
      <Stack.Screen name="foodpreferance" />
      <Stack.Screen name="healthassessment" />
      <Stack.Screen name="report/weeklyreport" />
      <Stack.Screen name="process" />
      <Stack.Screen name="advice" />
      <Stack.Screen name="assessment/certificate" />
      <Stack.Screen name="boosterdiet/boosters" />
      <Stack.Screen name="boosterdiet/store" />
      <Stack.Screen name="boosterdiet/ordersection" />
      <Stack.Screen name="boosterdiet/cart" />
      <Stack.Screen name="boosterdiet/checkout" />
      <Stack.Screen name="boosterdiet/confirmation" />
      <Stack.Screen name="boosterdiet/dietplan" />
      <Stack.Screen name="analysis/stepanalyst" />
      <Stack.Screen name="certification/daily" />
      <Stack.Screen name="immunity/dailyimmunity" />
    </Stack>
  );
}
