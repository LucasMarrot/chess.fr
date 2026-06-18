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
  const PIECE_SIZE = 48;

  return (
    <LocalGameModal
      visible={visible}
      title="Choisir la promotion"
      description="Sélectionne la pièce de promotion."
      onRequestClose={onCancel}
      theme={theme}
      actions={
        <ChessButton variant="secondary" size="md" onPress={onCancel}>
          Annuler
        </ChessButton>
      }
    >
      <XStack width="100%" gap="$3" flexWrap="nowrap" justifyContent="center">
        {promotionOptions.map((pieceOption) => {
          const color = pieceOption[0];
          const type = pieceOption[1].toUpperCase();
          const formattedKey = `${color}${type}` as keyof typeof defaultPieces;

          const PieceIcon = defaultPieces[formattedKey];

          return (
            <Pressable
              key={pieceOption}
              style={[
                localGameStyles.promotionOption,
                {
                  borderColor: theme.buttonPrimaryBorder,
                  backgroundColor: theme.promotionOptionBackground,
                  width: PIECE_SIZE + 16,
                  height: PIECE_SIZE + 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              onPress={() => {
                onConfirmPiece(pieceOption);
              }}
            >
              {PieceIcon ? PieceIcon({ squareWidth: PIECE_SIZE, isDragging: false }) : null}
            </Pressable>
          );
        })}
      </XStack>
    </LocalGameModal>
  );
};
