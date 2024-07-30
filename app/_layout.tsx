import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as React from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import  { LanguageProvider } from './LanguageContext';
import useLoadedFonts from './../components/useLoadedFonts';
import commonHeaderOptions from './../components/CommonHeader';

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const fontsLoaded = useLoadedFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ ...commonHeaderOptions, headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ ...commonHeaderOptions, headerShown: false }} />
          <Stack.Screen name="SettingsModal" options={{ ...commonHeaderOptions, presentation: 'modal' }} />
          <Stack.Screen name="GameMimic" options={ commonHeaderOptions } />
          <Stack.Screen name="GameKaraoke" options={ commonHeaderOptions } />
        </Stack>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default RootLayout;