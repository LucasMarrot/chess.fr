import React, { useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { G, Svg } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useChessboard } from '../context/chessboard-context';
import { Coords, CustomPieceFn, Piece as Pc, Square } from '../types';
import { ChessboardDnDContext } from './DnDRoot';

type PieceProps = {
  isPremovedPiece?: boolean;
  piece: Pc;
  square: Square;
  squares: { [square in Square]?: Coords };
};

export function Piece({ isPremovedPiece = false, piece, square, squares }: PieceProps) {
  const {
    animationDuration,
    boardWidth,
    boardOrientation,
    chessPieces,
    currentPosition,
    isWaitingForAnimation,
    onPieceClick,
    onSquareClick,
    onPieceDragBegin,
    onPieceDragEnd,
    onPromotionCheck,
    positionDifferences,
  } = useChessboard();

  const { dragState, lastDrop, clearLastDrop } = useContext(ChessboardDnDContext);
  const skipResetRef = useRef(false);
  const isDropAnimatingRef = useRef(false);
  const dropAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragSquare = dragState.activeId?.toString()?.split('-')[0];
  const dragPiece = dragState.activeId?.toString()?.split('-')[1];
  const isDragging = dragState.isDragging && dragPiece === piece && dragSquare === square;

  const zIndex = useSharedValue(5);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const dragOpacity = useSharedValue(1);

  useEffect(() => {
    if (isDragging) {
      onPieceDragBegin(piece, square);
      zIndex.value = 10;
      dragOpacity.value = withTiming(0, { duration: 80 });
    } else {
      onPieceDragEnd(piece, square);
      zIndex.value = 5;
      if (!isDropAnimatingRef.current) {
        dragOpacity.value = withTiming(1, { duration: 80 });
      }
    }
  }, [isDragging, piece, square, onPieceDragBegin, onPieceDragEnd]);

  useEffect(() => {
    return () => {
      if (dropAnimationTimeoutRef.current) {
        clearTimeout(dropAnimationTimeoutRef.current);
      }
    };
  }, []);

  const getSquareDelta = (sourceSq: Square, targetSq: Square) => {
    const squareWidth = boardWidth / 8;
    const xDelta =
      (boardOrientation === 'black' ? -1 : 1) *
      (targetSq.charCodeAt(0) - sourceSq.charCodeAt(0)) *
      squareWidth;
    const yDelta =
      (boardOrientation === 'black' ? -1 : 1) *
      (Number(sourceSq[1]) - Number(targetSq[1])) *
      squareWidth;

    return { xDelta, yDelta };
  };

  const getSquareTopLeft = (targetSq: Square) => {
    const squareWidth = boardWidth / 8;
    const file = targetSq.charCodeAt(0) - 97;
    const rank = Number(targetSq[1]) - 1;

    const col = boardOrientation === 'black' ? 7 - file : file;
    const row = boardOrientation === 'black' ? rank : 7 - rank;

    return {
      x: col * squareWidth,
      y: row * squareWidth,
    };
  };

  // Animate piece movement
  useEffect(() => {
    const removedPiece = positionDifferences.removed?.[square];
    if (!positionDifferences.added || !removedPiece) return;

    const newSquare = (Object.entries(positionDifferences.added) as [Square, Pc][]).find(
      ([s, p]) => p === removedPiece || onPromotionCheck(square, s, removedPiece),
    );

    if (isWaitingForAnimation && newSquare && !isPremovedPiece) {
      const sourceSq = square;
      const targetSq = newSquare[0];
      const { xDelta, yDelta } = getSquareDelta(sourceSq, targetSq);
      const isMovingDown = yDelta > 0;

      translateX.value = withTiming(xDelta, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(yDelta, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      });
      zIndex.value = isMovingDown ? 30 : 6;
      opacity.value = withTiming(1, { duration: 100 });
    }
  }, [
    positionDifferences,
    isWaitingForAnimation,
    isPremovedPiece,
    boardWidth,
    boardOrientation,
    square,
    onPromotionCheck,
  ]);

  // On capture, fade out the removed piece with a short elegant transition.
  useEffect(() => {
    const removedPiece = positionDifferences.removed?.[square];

    if (!isWaitingForAnimation || !removedPiece || isPremovedPiece) {
      opacity.value = withTiming(1, { duration: 90 });
      return;
    }

    const newSquare = (Object.entries(positionDifferences.added) as [Square, Pc][]).find(
      ([targetSquare, targetPiece]) =>
        targetPiece === removedPiece || onPromotionCheck(square, targetSquare, removedPiece),
    );

    if (!newSquare) {
      opacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [
    isPremovedPiece,
    isWaitingForAnimation,
    onPromotionCheck,
    opacity,
    positionDifferences.added,
    positionDifferences.removed,
    square,
  ]);

  // Reset transform
  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }
    if (squares[square]) {
      translateX.value = withTiming(0, {
        duration: Math.max(90, animationDuration * 0.6),
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: Math.max(90, animationDuration * 0.6),
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 100 });
    }
  }, [animationDuration, currentPosition, squares, square]);

  useEffect(() => {
    if (!lastDrop) return;
    const activeId = lastDrop.activeId?.toString();
    const targetSquare = lastDrop.targetSquare?.toString();
    if (!activeId || targetSquare !== square) return;

    const [, dropPiece] = activeId.split('-');
    if (dropPiece !== piece) return;
    const { x, y } = getSquareTopLeft(square);
    const releaseX = lastDrop.activeLayout.x + lastDrop.centerOffsetX - x;
    const releaseY = lastDrop.activeLayout.y + lastDrop.centerOffsetY - y;

    isDropAnimatingRef.current = true;
    skipResetRef.current = true;
    translateX.value = releaseX;
    translateY.value = releaseY;
    opacity.value = withTiming(1, { duration: 80 });
    dragOpacity.value = withTiming(1, { duration: 60 });
    zIndex.value = 8;
    translateX.value = withTiming(0, {
      duration: Math.max(110, animationDuration * 0.5),
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: Math.max(110, animationDuration * 0.5),
      easing: Easing.out(Easing.cubic),
    });

    clearLastDrop();

    if (dropAnimationTimeoutRef.current) {
      clearTimeout(dropAnimationTimeoutRef.current);
    }
    dropAnimationTimeoutRef.current = setTimeout(
      () => {
        isDropAnimatingRef.current = false;
      },
      Math.max(140, animationDuration * 0.5),
    );
  }, [animationDuration, clearLastDrop, lastDrop, piece, square]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      zIndex: zIndex.value,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      opacity: opacity.value * dragOpacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, { position: 'relative' }]}>
      <Pressable
        onPress={() => {
          onPieceClick(piece, square);
          onSquareClick(square, piece);
        }}
      >
        {typeof chessPieces[piece] === 'function' ? (
          (chessPieces[piece] as CustomPieceFn)({
            squareWidth: boardWidth / 8,
            isDragging: isDragging ?? false,
            square,
          })
        ) : (
          <Svg
            viewBox="0 0 45 45"
            width={boardWidth / 8}
            height={boardWidth / 8}
            style={{
              transform: [{ scale: 1 }],
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            <G>{chessPieces[piece] as ReactNode}</G>
          </Svg>
        )}
      </Pressable>
    </Animated.View>
  );
}
