import { Pressable, Image } from 'react-native';
import { XStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import type { Piece } from '../chessboard-lib/types';

import { LocalGameModal } from './LocalGameModal';
import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';

const getPromotionImageSource = (pieceOption: string) => {
  const normalized = pieceOption.toLowerCase();

  switch (normalized) {
    case 'wq':
    case 'q':
      return require('../../../assets/images/pieces/queenW.png');

    case 'wr':
    case 'r':
      return require('../../../assets/images/pieces/rookW.png');

    case 'wn':
    case 'n':
      return require('../../../assets/images/pieces/knightW.png');

    case 'wb':
    case 'b':
      return require('../../../assets/images/pieces/bishopW.png');

    case 'bq':
      return require('../../../assets/images/pieces/queenB.png');
    case 'br':
      return require('../../../assets/images/pieces/rookB.png');
    case 'bn':
      return require('../../../assets/images/pieces/knightB.png');
    case 'bb':
      return require('../../../assets/images/pieces/bishopB.png');

    default:
      return require('../../../assets/images/pieces/queenW.png');
  }
};

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
          const imageSource = getPromotionImageSource(pieceOption as string);

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
              {imageSource && (
                <Image
                  source={imageSource}
                  style={{ width: PIECE_SIZE, height: PIECE_SIZE }}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          );
        })}
      </XStack>
    </LocalGameModal>
  );
};
