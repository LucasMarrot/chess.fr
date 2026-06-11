import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useDraggable } from '@mgcrea/react-native-dnd';
import { StyleProp, ViewStyle } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import Animated, { useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { G, Svg } from 'react-native-svg';

import { defaultPieces } from '../media/pieces';
import { CustomPieceFn, Piece as Pc } from '../types';

type PieceProps = {
  piece: Pc;
  width: number;
  customPieceJSX?: CustomPieceFn;
  dndId: string;
};

export const SparePiece = ({ piece, width, customPieceJSX, dndId }: PieceProps) => {
  const renderPiece = customPieceJSX ?? defaultPieces[piece as keyof typeof defaultPieces];
  const [isDragging, setIsDragging] = useState(false);

  const dnd = useDraggable({
    id: dndId,
    data: { piece, isSpare: true },
  }) as {
    state: { value: string };
    props: Record<string, unknown> & { style?: unknown };
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: dnd.state.value === 'dragging' ? 0.5 : 1,
  }));

  useAnimatedReaction(
    () => dnd.state.value === 'dragging',
    (dragging, previousDragging) => {
      if (dragging !== previousDragging) {
        scheduleOnRN(setIsDragging, dragging);
      }
    },
    [dnd.state],
  );

  const { style: dndStyle, ...dndProps } = dnd.props;

  return (
    <Animated.View
      {...dndProps}
      testID={`piece-${piece}`}
      style={[dndStyle as StyleProp<ViewStyle>, animatedStyle]}
    >
      {typeof renderPiece === 'function' ? (
        (renderPiece as CustomPieceFn)({
          squareWidth: width,
          isDragging,
        })
      ) : (
        <Svg viewBox="1 1 43 43" width={width} height={width}>
          <G>{renderPiece as ReactNode}</G>
        </Svg>
      )}
    </Animated.View>
  );
};
