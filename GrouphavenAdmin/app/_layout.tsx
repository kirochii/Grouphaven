import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from 'expo-router';

import React, { useEffect } from 'react';
import { TamaguiProvider } from 'tamagui';
import { useFonts } from 'expo-font';

import config from '../tamagui.config';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}
