import { useRouter } from 'expo-router';
import { View, YStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import { AppHeader } from '@/components/headers/AppHeader';

export default function HomeScreen() {
  const router = useRouter();

  const handlePlayOnline = () => {
    router.push({
      pathname: '/local-game/config',
      params: {
        mode: 'online',
      },
    });
  };

  return (
    <>
      <AppHeader />
      <View
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        p="$4"
      >
        <YStack width="100%" maxWidth={360} alignItems="center" gap="$4">
          <ChessButton variant="primary" size="lg" fullWidth onPress={handlePlayOnline}>
            Jouer en ligne
          </ChessButton>
          <ChessButton
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => router.push('/local-game/config')}
          >
            Jouer une partie
          </ChessButton>
        </YStack>
      </View>
    </>
  );
}
