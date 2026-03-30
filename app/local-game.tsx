import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'tamagui';

import { getLocalTimeControlByKey } from '@/constants/local-time-controls';
import { LocalChessGame } from '@/components/chess/LocalChessGame';

export default function LocalGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ timeControl?: string | string[] }>();
  const timeControl = getLocalTimeControlByKey(params.timeControl);

  return (
    <View flex={1} backgroundColor="$background">
      <Stack.Screen options={{ headerShown: false }} />
      <LocalChessGame timeControl={timeControl} onExit={() => router.replace('/(tabs)')} />
    </View>
  );
}
