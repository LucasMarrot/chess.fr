import '@tamagui/native/setup-zeego';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Vérification initiale de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Écoute des changements (Login / Logout)
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
    const inPublicOnlineGame = segments[0] === 'local-game';

    if (!session && !inAuthGroup && !inPublicOnlineGame) {
      // Pas de session -> redirection vers login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Session présente -> redirection vers l'app
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="local-game" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
