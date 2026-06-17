import React, { useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useChessboard } from '../context/chessboard-context';
import { BoardOrientation, Coords, Piece, Square as Sq } from '../types';
import { ChessboardDnDContext } from './DnDRoot';

type SquareProps = {
  children: ReactNode;
  setSquares: React.Dispatch<React.SetStateAction<{ [square in Sq]?: Coords }>>;
  square: Sq;
  squareColor: 'white' | 'black';
  squareHasPremove: boolean;
};

export function Square({
  square,
  squareColor,
  setSquares,
  squareHasPremove,
  children,
}: SquareProps) {
  const squareRef = useRef<View>(null);
  const {
    boardWidth,
    boardOrientation,
    clearArrows,
    currentPosition,
    customBoardStyle,
    customDarkSquareStyle,
    customDropSquareStyle,
    customLightSquareStyle,
    customPremoveDarkSquareStyle,
    customPremoveLightSquareStyle,
    customSquareStyles,
    checkHighlightColor,
    handleSetPosition,
    isWaitingForAnimation,
    onPromotionCheck,
    onSquareClick,
    positionDifferences,
    squareOverlayTintColor,
    whiteKingInCheck,
    blackKingInCheck,
  } = useChessboard();

  const { dragState, dropState, clearDropState } = useContext(ChessboardDnDContext);
  const isOver =
    dragState.droppableActiveId === square ||
    dragState.droppableActiveId?.toString() === square ||
    (typeof dragState.droppableActiveId === 'string' && dragState.droppableActiveId === square);
  const piece = currentPosition[square];
  const pieceKey = String(piece ?? '');
  const isDraggingFromHere = Boolean(
    dragState.isDragging && piece && dragState.activeId?.toString() === `${square}-${piece}`,
  );
  const isAnimatingFromHere = useMemo(() => {
    if (!isWaitingForAnimation) return false;
    const removedPiece = positionDifferences.removed?.[square];
    if (!removedPiece) return false;

    return Object.entries(positionDifferences.added).some(([targetSquare, targetPiece]) => {
      if (targetPiece === removedPiece) return true;
      return onPromotionCheck(square, targetSquare as Sq, removedPiece);
    });
  }, [
    isWaitingForAnimation,
    onPromotionCheck,
    positionDifferences.added,
    positionDifferences.removed,
    square,
  ]);

  const defaultSquareStyle = {
    ...borderRadius(square, boardOrientation, customBoardStyle),
    ...(squareColor === 'black' ? customDarkSquareStyle : customLightSquareStyle),
    ...(squareHasPremove &&
      (squareColor === 'black' ? customPremoveDarkSquareStyle : customPremoveLightSquareStyle)),
    ...(isOver ? customDropSquareStyle : {}),
  };

  const squareStyle = !squareHasPremove && customSquareStyles?.[square];
  const isGradient = squareStyle && 'isGradient' in squareStyle;

  const lastProcessedDrop = useRef<string | null>(null);

  useEffect(() => {
    if (dropState.droppedId && dropState.droppedTargetSquare === square) {
      const sourceSquare = dropState.droppedId?.toString().split('-')[0];
      const droppedPiece = dropState.droppedId?.toString().split('-')[1];
      const dropKey = `${dropState.droppedId}-${dropState.droppedTargetSquare}`;

      if (sourceSquare && droppedPiece && lastProcessedDrop.current !== dropKey) {
        lastProcessedDrop.current = dropKey;

        clearDropState();

        handleSetPosition(sourceSquare as Sq, square, droppedPiece as Piece, true);

        setTimeout(() => {
          if (lastProcessedDrop.current === dropKey) {
            lastProcessedDrop.current = null;
          }
        }, 100);
      }
    }
  }, [dropState.droppedId, dropState.droppedTargetSquare, square, clearDropState]);

  return (
    <Pressable
      ref={squareRef}
      onLayout={() => {
        squareRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setSquares((oldSquares) => {
            const previous = oldSquares[square];
            if (previous && previous.x === pageX && previous.y === pageY) {
              return oldSquares;
            }

            return {
              ...oldSquares,
              [square]: { x: pageX, y: pageY },
            };
          });
        });
      }}
      style={[
        defaultSquareStyle as import('react-native').ViewStyle,
        {
          position: 'relative',
          width: boardWidth / 8,
          height: boardWidth / 8,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: isDraggingFromHere ? 1000 : isAnimatingFromHere ? 900 : isOver ? 2 : 1,
          elevation: isDraggingFromHere ? 1000 : isAnimatingFromHere ? 900 : isOver ? 2 : 1,
        },
      ]}
      onPress={() => {
        onSquareClick(square, piece);
        clearArrows();
      }}
    >
      <View
        style={{
          width: boardWidth / 8,
          height: boardWidth / 8,
          justifyContent: 'center',
          alignItems: 'center',
          ...(squareStyle && !isGradient && squareStyle),
          ...(!squareHasPremove &&
            whiteKingInCheck &&
            pieceKey === 'wK' && { backgroundColor: checkHighlightColor }),
          ...(!squareHasPremove &&
            blackKingInCheck &&
            pieceKey === 'bK' && { backgroundColor: checkHighlightColor }),
        }}
      >
        {isGradient ? (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: squareOverlayTintColor,
              borderRadius: (squareStyle as any)?.borderRadius || 0,
              ...((squareStyle as any)?.gradientType === 'capture'
                ? { transform: [{ scale: 0.4 }] }
                : { transform: [{ scale: 0.3 }] }),
            }}
          />
        ) : null}
        {children}
      </View>
    </Pressable>
  );
}

const borderRadius = (
  square: Sq,
  boardOrientation: BoardOrientation,
  customBoardStyle?: Record<string, string | number>,
) => {
  if (!customBoardStyle?.borderRadius) return {};

  if (square === 'a1') {
    return boardOrientation === 'white'
      ? { borderBottomLeftRadius: customBoardStyle.borderRadius }
      : { borderTopRightRadius: customBoardStyle.borderRadius };
  }
  if (square === 'a8') {
    return boardOrientation === 'white'
      ? { borderTopLeftRadius: customBoardStyle.borderRadius }
      : { borderBottomRightRadius: customBoardStyle.borderRadius };
  }
  if (square === 'h1') {
    return boardOrientation === 'white'
      ? { borderBottomRightRadius: customBoardStyle.borderRadius }
      : { borderTopLeftRadius: customBoardStyle.borderRadius };
  }
  if (square === 'h8') {
    return boardOrientation === 'white'
      ? { borderTopRightRadius: customBoardStyle.borderRadius }
      : { borderBottomLeftRadius: customBoardStyle.borderRadius };
  }
  return {};
};
