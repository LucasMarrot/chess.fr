import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import { defaultPieces } from '../chessboard-lib/media/pieces';
import type { Piece } from '../chessboard-lib/types';

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
  if (!visible) return null;

  return (
    <Pressable
      style={[localGameStyles.promotionBackdrop, { backgroundColor: theme.overlayBackdrop }]}
      onPress={onCancel}
    >
      <Pressable onPress={() => {}}>
        <YStack
          style={localGameStyles.promotionPanel}
          backgroundColor={theme.light}
          borderColor={theme.buttonPrimaryBorder}
        >
          <Text color={theme.dark} fontSize="$4" fontWeight="700">
            Choisir la promotion
          </Text>
          <Text color={theme.interactionGrey} fontSize="$2">
            Selectionne la piece de promotion.
          </Text>

          <XStack gap="$2" flexWrap="wrap">
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

          <ChessButton variant="secondary" size="md" onPress={onCancel}>
            Annuler
          </ChessButton>
        </YStack>
      </Pressable>
    </Pressable>
  );
};
