import React, { forwardRef, useCallback, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { getTokens } from 'tamagui';

import {
  Chessboard as NativeChessboard,
  type ClearPremoves as NativeClearPremoves,
} from './chessboard-lib';
import type {
  BoardPosition,
  ChessboardProps as NativeChessboardProps,
  CustomSquareStyles,
  Piece,
  Square,
} from './chessboard-lib/types';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const EMPTY_SQUARE_STYLES: CustomSquareStyles = {};

export type ClearPremoves = NativeClearPremoves;

export type ChessBoardProps = Omit<
  NativeChessboardProps,
  'boardWidth' | 'position' | 'customDarkSquareStyle' | 'customLightSquareStyle' | 'onPieceDrop'
> & {
  position?: string | BoardPosition;
  size?: { width: number; height: number };
  boardWidth?: number;
  onPress?: () => void;
  onPieceDrop: (sourceSquare: Square, targetSquare: Square, piece: Piece) => boolean;
  customDarkSquareStyle?: Record<string, string | number>;
  customLightSquareStyle?: Record<string, string | number>;
  customSquareStyles?: CustomSquareStyles;
};

const Chessboard = forwardRef<ClearPremoves, ChessBoardProps>(
  (
    {
      position = START_FEN,
      onPieceDrop,
      size,
      boardWidth: boardWidthProp,
      animationDuration = 200,
      onPress,
      onPromotionCheck = () => false,
      onSquareClick,
      isDraggablePiece = () => true,
      customDarkSquareStyle,
      customLightSquareStyle,
      customSquareStyles = EMPTY_SQUARE_STYLES,
      customBoardStyle,
      boardOrientation = 'white',
      arePremovesAllowed = false,
      showPromotionDialog = false,
      autoPromoteToQueen = false,
      whiteKingInCheck = false,
      blackKingInCheck = false,
      ...rest
    },
    ref,
  ) => {
    const tokens = getTokens();
    const window = useWindowDimensions();

    const resolvedBoardWidth = useMemo(() => {
      if (boardWidthProp && boardWidthProp > 0) return boardWidthProp;
      if (size?.width && size?.height) return Math.min(size.width, size.height);
      if (size?.width) return size.width;
      if (size?.height) return size.height;
      return window.width;
    }, [boardWidthProp, size?.height, size?.width, window.width]);

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
    const resolvedPosition = position === START_FEN ? 'start' : (position ?? 'start');

    const boardStyle = useMemo(() => {
      if (!resolvedBoardWidth || resolvedBoardWidth <= 0) return undefined;
      return { width: resolvedBoardWidth, height: resolvedBoardWidth };
    }, [resolvedBoardWidth]);

    const handleSquareClick = useCallback(
      (square: Square, piece?: Piece) => {
        const result = onSquareClick?.(square, piece);
        if (onPress) onPress();
        return result;
      },
      [onPress, onSquareClick],
    );

    return (
      <View style={boardStyle}>
        <NativeChessboard
          ref={ref}
          boardWidth={resolvedBoardWidth}
          position={resolvedPosition}
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
          onPieceDrop={onPieceDrop}
          onPromotionCheck={onPromotionCheck}
          onSquareClick={handleSquareClick}
          isDraggablePiece={isDraggablePiece}
          {...rest}
        />
      </View>
    );
  },
);

Chessboard.displayName = 'Chessboard';

export default Chessboard;
