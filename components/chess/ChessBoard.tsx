import React, { forwardRef, useMemo } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { getTokens } from 'tamagui';
import { Chessboard as LibChessboard } from './chessboard-lib';
import type { ClearPremoves } from './chessboard-lib';
import type { CustomSquareStyles, Piece, Square } from './chessboard-lib/types';

export type { ClearPremoves };

export type ChessBoardProps = {
  position?: string;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
  size?: { width: number; height: number };
  animationDuration?: number;
  onPress?: () => void;
  onPromotionCheck?: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
  onSquareClick?: (square: Square, piece?: Piece) => boolean | void;
  isDraggablePiece?: ({ piece, sourceSquare }: { piece: Piece; sourceSquare: Square }) => boolean;
  customDarkSquareStyle?: Record<string, string | number>;
  customLightSquareStyle?: Record<string, string | number>;
  customSquareStyles?: CustomSquareStyles;
  customBoardStyle?: Record<string, string | number>;
  boardOrientation?: 'black' | 'white';
  arePremovesAllowed?: boolean;
  showPromotionDialog?: boolean;
  autoPromoteToQueen?: boolean;
  whiteKingInCheck?: boolean;
  blackKingInCheck?: boolean;
};

const Chessboard = forwardRef<ClearPremoves, ChessBoardProps>(
  (
    {
      position = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      onPieceDrop,
      size,
      animationDuration = 200,
      onPress,
      onPromotionCheck = () => false,
      onSquareClick = () => true,
      isDraggablePiece = () => true,
      customDarkSquareStyle,
      customLightSquareStyle,
      customSquareStyles = {},
      customBoardStyle,
      boardOrientation = 'white',
      arePremovesAllowed = false,
      showPromotionDialog = false,
      autoPromoteToQueen = false,
      whiteKingInCheck = false,
      blackKingInCheck = false,
    },
    ref,
  ) => {
    const tokens = getTokens();
    const boardWidth = size?.width ?? Dimensions.get('window').width;
    const fallbackDarkSquareStyle = useMemo(
      () => ({ backgroundColor: String(tokens.color.boardWoodDark.val) }),
      [tokens],
    );
    const fallbackLightSquareStyle = useMemo(
      () => ({ backgroundColor: String(tokens.color.boardWoodLight.val) }),
      [tokens],
    );

    const resolvedDarkSquareStyle = customDarkSquareStyle ?? fallbackDarkSquareStyle;
    const resolvedLightSquareStyle = customLightSquareStyle ?? fallbackLightSquareStyle;

    const boardElement = (
      <LibChessboard
        ref={ref}
        position={position === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' ? 'start' : position}
        boardWidth={boardWidth}
        animationDuration={animationDuration}
        boardOrientation={boardOrientation}
        customDarkSquareStyle={resolvedDarkSquareStyle as Record<string, string>}
        customLightSquareStyle={resolvedLightSquareStyle as Record<string, string>}
        customSquareStyles={customSquareStyles}
        customBoardStyle={customBoardStyle}
        arePremovesAllowed={arePremovesAllowed}
        showPromotionDialog={showPromotionDialog}
        autoPromoteToQueen={autoPromoteToQueen}
        whiteKingInCheck={whiteKingInCheck}
        blackKingInCheck={blackKingInCheck}
        onPieceDrop={(sourceSquare, targetSquare, piece) =>
          onPieceDrop(sourceSquare as Square, targetSquare as Square, piece)
        }
        onPromotionCheck={(sourceSquare, targetSquare, piece) =>
          onPromotionCheck(sourceSquare as Square, targetSquare as Square, piece)
        }
        onSquareClick={(square, piece) =>
          onSquareClick(square as Square, piece as Piece | undefined)
        }
        isDraggablePiece={({ piece, sourceSquare }) =>
          isDraggablePiece({ piece, sourceSquare: sourceSquare as Square })
        }
        onPromotionPieceSelect={(piece, promoteFromSquare, promoteToSquare) => {
          if (promoteFromSquare && promoteToSquare && piece) {
            const ok = onPieceDrop(promoteFromSquare as Square, promoteToSquare as Square, piece);
            return ok;
          }
          return true;
        }}
      />
    );

    const content = (
      <View style={boardWidth > 0 ? { width: boardWidth } : undefined}>{boardElement}</View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.2}>
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  },
);

Chessboard.displayName = 'Chessboard';

export default Chessboard;
