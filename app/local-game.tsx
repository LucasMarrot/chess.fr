import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { View } from 'tamagui';

import { getLocalTimeControlByKey } from '@/constants/local-time-controls';
import { LocalChessGame } from '@/components/chess/LocalChessGame';

export default function LocalGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ timeControl?: string | string[] }>();
  const timeControl = getLocalTimeControlByKey(params.timeControl);

  const handleExit = () => {
    Alert.alert('Quitter la partie ?', 'La partie en cours sera abandonnee.', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => router.replace('/(tabs)'),
      },
    ]);
  };

  return (
    <View flex={1} backgroundColor="$background">
      <Stack.Screen options={{ headerShown: false }} />
      <LocalChessGame timeControl={timeControl} onExit={handleExit} />
    </View>
  );
}
