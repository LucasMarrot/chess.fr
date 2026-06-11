import React, { useMemo, useContext } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDndContext } from '@mgcrea/react-native-dnd';

import { useChessboard } from '../context/chessboard-context';
import { ChessboardDnDContext } from './DnDRoot';
import type { CustomPieceFn, Piece, Square } from '../types';

const emptyOverlayStyle = { opacity: 0 } as const;

export const DragOverlay = () => {
  const { boardWidth, chessPieces } = useChessboard();
  const { draggableActiveLayout } = useDndContext();
  const { dragCenterOffset, dragState } = useContext(ChessboardDnDContext);
  const activeId = dragState.isDragging ? dragState.activeId : null;

  const [activeSquare, activePiece] = useMemo<[Square | null, Piece | null]>(() => {
    if (!activeId) return [null, null];
    const [square, piece] = activeId.toString().split('-');
    return [(square as Square | undefined) ?? null, (piece as Piece) ?? null];
  }, [activeId]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!activeId || !draggableActiveLayout.value) return emptyOverlayStyle;

    return {
      opacity: 1,
      transform: [
        { translateX: draggableActiveLayout.value.x + dragCenterOffset.value.x },
        { translateY: draggableActiveLayout.value.y + dragCenterOffset.value.y },
      ],
    };
  }, [activeId, dragCenterOffset, draggableActiveLayout]);

  if (!activeSquare || !activePiece) return null;

  const pieceRenderer = chessPieces[activePiece];
  if (!pieceRenderer) return null;

  const size = boardWidth / 8;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: boardWidth,
        height: boardWidth,
        zIndex: 2000,
        elevation: 2000,
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          },
          animatedStyle,
        ]}
      >
        {typeof pieceRenderer === 'function'
          ? (pieceRenderer as CustomPieceFn)({
              squareWidth: size,
              isDragging: true,
              square: activeSquare,
            })
          : pieceRenderer}
      </Animated.View>
    </View>
  );
};
