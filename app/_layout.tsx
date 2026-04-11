import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

import { ToastProvider, ToastViewport } from '@tamagui/toast';
import { CurrentToast } from '@/components/ui/CurrentToast';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {/* On ajoute le ToastProvider ici pour qu'il soit global */}
      <ToastProvider swipeDirection="up" duration={4000}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>

        {/* Rendu visuel et positionnement des Toasts */}
        <CurrentToast />
        <ToastViewport top="$8" left={0} right={0} paddingHorizontal="$4" />
      </ToastProvider>
      <StatusBar style="auto" />
    </TamaguiProvider>
  );
}
