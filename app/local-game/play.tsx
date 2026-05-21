import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'tamagui';

import { getLocalTimeControlByKey } from '@/constants/local-time-controls';
import { LocalChessGame } from '@/components/chess/LocalChessGame';

export default function LocalGamePlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ timeControl?: string | string[] }>();
  const timeControl = getLocalTimeControlByKey(params.timeControl);

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
        onExit={handleExit}
        onReturnHome={handleReturnHome}
      />
    </View>
  );
}
