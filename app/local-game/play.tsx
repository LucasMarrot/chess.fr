import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'tamagui';

import { getLocalTimeControlByKey } from '@/constants/local-time-controls';
import { LocalChessGame } from '@/components/chess/LocalChessGame';

type SideParam = 'white' | 'black' | 'random';

function resolveInitialSide(input?: string | string[]): 'white' | 'black' {
  const value = Array.isArray(input) ? input[0] : input;
  if (value === 'white' || value === 'black') return value;
  if (value === 'random') return Math.random() < 0.5 ? 'white' : 'black';
  return 'white';
}

export default function LocalGamePlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ timeControl?: string | string[]; color?: SideParam }>();
  const timeControl = getLocalTimeControlByKey(params.timeControl);
  const initialSide = resolveInitialSide(params.color);

  const handleExit = () => {
    router.replace('/(tabs)');
  };

  const handleReturnHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View flex={1} backgroundColor="$background">
      <LocalChessGame
        timeControl={timeControl}
        initialOrientation={initialSide}
        onExit={handleExit}
        onReturnHome={handleReturnHome}
      />
    </View>
  );
}
