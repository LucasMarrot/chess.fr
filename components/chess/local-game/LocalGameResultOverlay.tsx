import { Text } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import type { LocalGameResult } from '../stores/use-local-chess-game-store';

import { LocalGameModal } from './LocalGameModal';
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
  return (
    <LocalGameModal
      visible={Boolean(result)}
      title={
        result?.outcome === 'win' && result.winner
          ? `Victoire ${colorToLabel(result.winner)}`
          : 'Partie nulle'
      }
      description={result ? resultReasonToLabel(result.reason) : undefined}
      theme={theme}
      actions={
        <>
          <ChessButton variant="primary" size="md" onPress={onReplay}>
            Rejouer
          </ChessButton>
          <ChessButton variant="secondary" size="md" onPress={onExit}>
            Revenir a la Home
          </ChessButton>
        </>
      }
    >
      {result?.outcome === 'win' && result.winner && result.loser ? (
        <Text color={theme.dark} fontSize="$3" fontWeight="600">
          Gagnant: {colorToLabel(result.winner)} | Perdant: {colorToLabel(result.loser)}
        </Text>
      ) : null}
    </LocalGameModal>
  );
};
