import { Stack, usePathname, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text, useTheme } from 'tamagui';

import { AppHeader } from '@/components/headers';
import { ChessButton } from '@/components/ui/ChessButton';

function LocalGameHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const title = pathname.endsWith('/play') ? 'Partie en cours' : 'Configuration locale';

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
          onPress={() => router.replace('/(tabs)')}
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
