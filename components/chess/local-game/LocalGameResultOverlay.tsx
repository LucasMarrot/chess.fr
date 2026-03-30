import { Text, View, XStack, YStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import type { LocalGameResult } from '../stores/use-local-chess-game-store';

import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';
import { colorToLabel, resultReasonToLabel } from './utils';

type LocalGameResultOverlayProps = {
  result: LocalGameResult | null;
  onReplay: () => void;
  onExit: () => void;
  theme: LocalGameTheme;
};

export const LocalGameResultOverlay = ({
  result,
  onReplay,
  onExit,
  theme,
}: LocalGameResultOverlayProps) => {
  if (!result) return null;

  return (
    <View style={[localGameStyles.endOverlay, { backgroundColor: theme.endOverlayBackdrop }]}>
      <YStack
        style={localGameStyles.endCard}
        backgroundColor={theme.light}
        borderColor={theme.buttonPrimaryBorder}
      >
        <Text color={theme.dark} fontSize="$7" fontWeight="700">
          {result.outcome === 'win' && result.winner
            ? `Victoire ${colorToLabel(result.winner)}`
            : 'Partie nulle'}
        </Text>

        <Text color={theme.interactionGrey} fontSize="$4">
          {resultReasonToLabel(result.reason)}
        </Text>

        {result.outcome === 'win' && result.winner && result.loser ? (
          <Text color={theme.dark} fontSize="$3" fontWeight="600">
            Gagnant: {colorToLabel(result.winner)} | Perdant: {colorToLabel(result.loser)}
          </Text>
        ) : null}

        <XStack gap="$2" flexWrap="wrap">
          <ChessButton variant="primary" size="md" onPress={onReplay}>
            Rejouer
          </ChessButton>
          <ChessButton variant="secondary" size="md" onPress={onExit}>
            Revenir a la Home
          </ChessButton>
        </XStack>
      </YStack>
    </View>
  );
};
