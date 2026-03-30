import { Text, XStack, YStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';
import { formatClock } from './utils';

type LocalGameStatusCardProps = {
  timeControlLabel: string;
  statusMessage: string;
  whiteMs: number;
  blackMs: number;
  isWhiteActive: boolean;
  isBlackActive: boolean;
  onFlipBoard: () => void;
  onExit: () => void;
  theme: LocalGameTheme;
};

export const LocalGameStatusCard = ({
  timeControlLabel,
  statusMessage,
  whiteMs,
  blackMs,
  isWhiteActive,
  isBlackActive,
  onFlipBoard,
  onExit,
  theme,
}: LocalGameStatusCardProps) => {
  return (
    <YStack
      style={localGameStyles.statusCard}
      borderColor={theme.buttonPrimaryBorder}
      backgroundColor={theme.light}
    >
      <XStack alignItems="center" justifyContent="space-between" gap="$2">
        <Text color={theme.dark} fontSize="$3" fontWeight="700">
          Cadence {timeControlLabel}
        </Text>
        <XStack gap="$2">
          <ChessButton variant="secondary" size="sm" onPress={onFlipBoard}>
            Rotation 180
          </ChessButton>
          <ChessButton variant="secondary" size="sm" onPress={onExit}>
            Quitter
          </ChessButton>
        </XStack>
      </XStack>

      <XStack gap="$2">
        <YStack
          style={localGameStyles.clockCard}
          borderColor={isWhiteActive ? theme.primaryDark : theme.buttonPrimaryBorder}
          backgroundColor={isWhiteActive ? theme.activeClockBackground : theme.light}
        >
          <Text color={theme.interactionGrey} fontSize="$2">
            Blancs
          </Text>
          <Text color={theme.dark} fontSize="$6" fontWeight="700">
            {formatClock(whiteMs)}
          </Text>
        </YStack>

        <YStack
          style={localGameStyles.clockCard}
          borderColor={isBlackActive ? theme.primaryDark : theme.buttonPrimaryBorder}
          backgroundColor={isBlackActive ? theme.activeClockBackground : theme.light}
        >
          <Text color={theme.interactionGrey} fontSize="$2">
            Noirs
          </Text>
          <Text color={theme.dark} fontSize="$6" fontWeight="700">
            {formatClock(blackMs)}
          </Text>
        </YStack>
      </XStack>

      <Text color={theme.dark} fontSize="$4" fontWeight="700">
        {statusMessage}
      </Text>
    </YStack>
  );
};
