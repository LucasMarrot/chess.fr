import React, { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useChessboard } from '../context/chessboard-context';
import { Arrows } from './Arrows';
import { DragOverlay } from './DragOverlay';
import { WhiteKing } from './ErrorBoundary';
import { Squares } from './Squares';

export function Board() {
  const boardRef = useRef<View>(null);

  const {
    boardWidth,
    boardOverlayBackdropColor,
    onPromotionPieceSelect,
    setShowPromoteDialog,
    showPromoteDialog,
    customBoardStyle,
  } = useChessboard();

  return boardWidth ? (
    <View>
      <View
        ref={boardRef}
        style={{
          position: 'relative',
          ...boardStyles(boardWidth),
          ...customBoardStyle,
        }}
      >
        <Squares />
        <Arrows />
        <DragOverlay />

        {showPromoteDialog && (
          <View>
            <Pressable
              onPress={() => {
                setShowPromoteDialog(false);
                onPromotionPieceSelect?.();
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 100,
                backgroundColor: boardOverlayBackdropColor,
                width: boardWidth,
                height: boardWidth,
              }}
            />
          </View>
        )}
      </View>
    </View>
  ) : (
    <WhiteKing />
  );
}

const boardStyles = (width: number): ViewStyle => ({
  height: width,
  width,
});
