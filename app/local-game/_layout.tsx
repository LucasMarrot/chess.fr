import { Stack, usePathname, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text, useTheme } from 'tamagui';

import { AppHeader } from '@/components/headers';
import { useLocalChessUiStore } from '@/components/chess/stores/use-local-chess-ui-store';
import { ChessButton } from '@/components/ui/ChessButton';

function LocalGameHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const requestExitConfirm = useLocalChessUiStore((state) => state.requestExitConfirm);
  const title = pathname.endsWith('/play') ? 'Partie en cours' : 'Configuration';

  const handleBackPress = () => {
    if (pathname.endsWith('/play')) {
      requestExitConfirm();
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <AppHeader
      centerContent={
        <Text color="$dark" fontSize="$5" fontWeight="700" textAlign="center">
          {title}
        </Text>
      }
      leftContent={
        <ChessButton
          variant="rounded"
          size="icon"
          onPress={handleBackPress}
          iconLeft={<ChevronLeft size={18} color={theme.dark.val} />}
        />
      }
    />
  );
}

export default function LocalGameLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'default',
        header: () => <LocalGameHeader />,
      }}
    >
      <Stack.Screen name="config" />
      <Stack.Screen name="play" />
    </Stack>
  );
}
