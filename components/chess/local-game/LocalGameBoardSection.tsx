import type { RefObject } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { View, YStack } from 'tamagui';

import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';
import Chessboard, { type ClearPremoves } from '../ChessBoard';
import type { CustomSquareStyles, Piece, Square } from '../chessboard-lib/types';

type LocalGameBoardSectionProps = {
  chessboardRef: RefObject<ClearPremoves | null>;
  boardSize: number;
  fen: string;
  boardOrientation: 'white' | 'black';
  autoPromoteToQueen: boolean;
  customBoardStyle: Record<string, string | number>;
  customSquareStyles: CustomSquareStyles;
  captureSquareBox: {
    left: number;
    top: number;
    size: number;
  } | null;
  capturePulseStyle: StyleProp<ViewStyle>;
  theme: LocalGameTheme;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
  onSquareClick: (square: Square, piece?: Piece) => boolean | void;
  isDraggablePiece: ({ piece, sourceSquare }: { piece: Piece; sourceSquare: Square }) => boolean;
};

export const LocalGameBoardSection = ({
  chessboardRef,
  boardSize,
  fen,
  boardOrientation,
  autoPromoteToQueen,
  customBoardStyle,
  customSquareStyles,
  captureSquareBox,
  capturePulseStyle,
  theme,
  onPieceDrop,
  onSquareClick,
  isDraggablePiece,
}: LocalGameBoardSectionProps) => {
  return (
    <YStack flex={1} style={localGameStyles.boardArea}>
      <View style={[localGameStyles.boardFrame, { width: boardSize, height: boardSize }]}>
        <Chessboard
          ref={chessboardRef}
          size={{ width: boardSize, height: boardSize }}
          animationDuration={200}
          customDarkSquareStyle={{ backgroundColor: theme.boardWoodDark }}
          customLightSquareStyle={{ backgroundColor: theme.boardWoodLight }}
          customBoardStyle={customBoardStyle}
          position={fen}
          customSquareStyles={customSquareStyles}
          arePremovesAllowed={false}
          boardOrientation={boardOrientation}
          autoPromoteToQueen={autoPromoteToQueen}
          showPromotionDialog={false}
          whiteKingInCheck={false}
          blackKingInCheck={false}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          isDraggablePiece={isDraggablePiece}
        />

        {captureSquareBox ? (
          <Animated.View
            pointerEvents="none"
            style={[
              localGameStyles.captureFlash,
              {
                left: captureSquareBox.left,
                top: captureSquareBox.top,
                width: captureSquareBox.size,
                height: captureSquareBox.size,
                borderColor: theme.captureFlashBorder,
                backgroundColor: theme.captureFlashBackground,
              },
              capturePulseStyle,
            ]}
          />
        ) : null}
      </View>
    </YStack>
  );
};
