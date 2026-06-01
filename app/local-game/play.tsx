import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'tamagui';

import { getLocalTimeControlByKey } from '@/constants/local-time-controls';
import { LocalChessGame } from '@/components/chess/LocalChessGame';
import {
  createOnlineInviteLink,
  getOpponentColor,
  type OnlinePlayerColor,
} from '@/lib/online-chess';

type SideParam = 'white' | 'black' | 'random';

function resolveInitialSide(input?: string | string[]): 'white' | 'black' {
  const value = Array.isArray(input) ? input[0] : input;
  if (value === 'white' || value === 'black') return value;
  if (value === 'random') return Math.random() < 0.5 ? 'white' : 'black';
  return 'white';
}

export default function LocalGamePlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    timeControl?: string | string[];
    color?: SideParam;
    mode?: string | string[];
    roomId?: string | string[];
  }>();
  const timeControl = getLocalTimeControlByKey(params.timeControl);
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const colorParam = Array.isArray(params.color) ? params.color[0] : params.color;
  const isOnlineGame = mode === 'online' && Boolean(roomId);
  const onlinePlayerColor: OnlinePlayerColor = colorParam === 'black' ? 'black' : 'white';
  const initialSide = isOnlineGame ? onlinePlayerColor : resolveInitialSide(colorParam);
  const onlineInviteLink =
    isOnlineGame && roomId
      ? createOnlineInviteLink({
          roomId,
          timeControl: timeControl.key,
          guestColor: getOpponentColor(onlinePlayerColor),
        })
      : undefined;

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
        onlineRoomId={isOnlineGame ? roomId : undefined}
        onlinePlayerColor={isOnlineGame ? onlinePlayerColor : undefined}
        onlineInviteLink={onlineInviteLink}
      />
    </View>
  );
}
