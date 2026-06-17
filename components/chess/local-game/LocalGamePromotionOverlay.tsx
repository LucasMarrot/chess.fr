import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import { defaultPieces } from '../chessboard-lib/media/pieces';
import type { Piece } from '../chessboard-lib/types';

import { LocalGameModal } from './LocalGameModal';
import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';

type LocalGamePromotionOverlayProps = {
  visible: boolean;
  promotionOptions: Piece[];
  onConfirmPiece: (piece: Piece) => boolean;
  onCancel: () => void;
  theme: LocalGameTheme;
};

export const LocalGamePromotionOverlay = ({
  visible,
  promotionOptions,
  onConfirmPiece,
  onCancel,
  theme,
}: LocalGamePromotionOverlayProps) => {
  return (
    <LocalGameModal
      visible={visible}
      title="Choisir la promotion"
      description="Selectionne la piece de promotion."
      onRequestClose={onCancel}
      theme={theme}
      actions={
        <ChessButton variant="secondary" size="md" onPress={onCancel}>
          Annuler
        </ChessButton>
      }
    >
      <XStack width="100%" gap="$3" flexWrap="nowrap">
        {promotionOptions.map((pieceOption) => {
          const PieceIcon = defaultPieces[pieceOption];

          return (
            <Pressable
              key={pieceOption}
              style={[
                localGameStyles.promotionOption,
                {
                  borderColor: theme.buttonPrimaryBorder,
                  backgroundColor: theme.promotionOptionBackground,
                },
              ]}
              onPress={() => {
                onConfirmPiece(pieceOption);
              }}
            >
              {PieceIcon ? <PieceIcon /> : null}
            </Pressable>
          );
        })}
      </XStack>
    </LocalGameModal>
  );
};
