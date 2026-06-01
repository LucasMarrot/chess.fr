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
  canReplay?: boolean;
  replayLabel?: string;
};

export const LocalGameResultOverlay = ({
  result,
  onReplay,
  onExit,
  theme,
  canReplay = true,
  replayLabel = 'Rejouer',
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
          {canReplay ? (
            <ChessButton
              variant="primary"
              size="md"
              flex={1}
              onPress={onReplay}
              textProps={{
                numberOfLines: 1,
                adjustsFontSizeToFit: true,
                minimumFontScale: 0.75,
                textAlign: 'center',
              }}
            >
              {replayLabel}
            </ChessButton>
          ) : null}
          <ChessButton
            variant="secondary"
            size="md"
            flex={1}
            onPress={onExit}
            textProps={{
              numberOfLines: 1,
              adjustsFontSizeToFit: true,
              minimumFontScale: 0.75,
              textAlign: 'center',
            }}
          >
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
