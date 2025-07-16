import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_28pt-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_28pt-Bold.ttf'),
    'Inter-Black': require('../assets/fonts/Inter_28pt-Black.ttf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter_28pt-ExtraBold.ttf'),
    'Inter-ExtraLight': require('../assets/fonts/Inter_28pt-ExtraLight.ttf'),
    'Inter-Light': require('../assets/fonts/Inter_28pt-Light.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_28pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_28pt-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{
      animation: 'fade',
      presentation: 'transparentModal',
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="VerifyEmail" options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
      <Stack.Screen name="CompleteProfile" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Settings" options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" options={{ headerShown: false }} />
      <Stack.Screen name="ChangeEmail" options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" options={{ headerShown: false }} />
      <Stack.Screen name="VerifyAccount" options={{ headerShown: false }} />
      <Stack.Screen name="MatchPreference" options={{ headerShown: false }} />
      <Stack.Screen name="FAQ" options={{ headerShown: false }} />
    </Stack>
  );
}
