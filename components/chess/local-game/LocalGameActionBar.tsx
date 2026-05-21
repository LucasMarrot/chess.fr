import { Handshake, LogOut, Repeat, Repeat1, RepeatOff } from 'lucide-react-native';
import { Text, XStack, YStack, useTheme } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import { localGameStyles } from './styles';

type LocalGameActionBarProps = {
  isAutoFlipEnabled: boolean;
  onExitPress: () => void;
  onDrawPress: () => void;
  onFlipPress: () => void;
  onAutoFlipPress: () => void;
};

export const LocalGameActionBar = ({
  isAutoFlipEnabled,
  onExitPress,
  onDrawPress,
  onFlipPress,
  onAutoFlipPress,
}: LocalGameActionBarProps) => {
  const theme = useTheme();

  return (
    <XStack style={localGameStyles.actionsRow}>
      <YStack alignItems="center" gap="$2">
        <ChessButton
          variant="selectableCard"
          shape="circle"
          size="iconLg"
          selected={isAutoFlipEnabled}
          onPress={onAutoFlipPress}
          iconLeft={
            isAutoFlipEnabled ? (
              <Repeat size={24} color={theme.light.val} />
            ) : (
              <RepeatOff size={24} color={theme.dark.val} />
            )
          }
        />
        <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
          Auto-Flip
        </Text>
      </YStack>
      {!isAutoFlipEnabled ? (
        <YStack alignItems="center" gap="$2">
          <ChessButton
            variant="selectableCard"
            shape="circle"
            size="iconLg"
            onPress={onFlipPress}
            iconLeft={<Repeat1 size={24} color={theme.dark.val} />}
          />
          <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
            Flip
          </Text>
        </YStack>
      ) : null}
      <YStack alignItems="center" gap="$2">
        <ChessButton
          variant="selectableCard"
          shape="circle"
          size="iconLg"
          onPress={onDrawPress}
          iconLeft={<Handshake size={24} color={theme.dark.val} />}
        />
        <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
          Draw
        </Text>
      </YStack>
      <YStack alignItems="center" gap="$2">
        <ChessButton
          variant="destructive"
          shape="circle"
          size="iconLg"
          onPress={onExitPress}
          iconLeft={<LogOut size={24} color={theme.light.val} />}
        />
        <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
          Quitter
        </Text>
      </YStack>
    </XStack>
  );
};
