import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet } from 'react-native';
import { getTokens } from 'tamagui';
import { BUTTON_FEEDBACK, CheckerTokenKey } from '@/constants/button-feedback';

type CheckerboardPressFeedbackProps = {
  playSignal: number;
  bleedHorizontal?: number;
  lightTokenKey?: CheckerTokenKey;
  darkTokenKey?: CheckerTokenKey;
};

type GridCell = {
  id: string;
  row: number;
  col: number;
  left: number;
  top: number;
  sequenceDelayMs: number;
};

export function CheckerboardPressFeedback({
  playSignal,
  bleedHorizontal = 0,
  lightTokenKey = BUTTON_FEEDBACK.checkerTokens.darkSurface.light,
  darkTokenKey = BUTTON_FEEDBACK.checkerTokens.darkSurface.dark,
}: CheckerboardPressFeedbackProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const progress = useRef(new Animated.Value(0)).current;
  const runningAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const cellSize = BUTTON_FEEDBACK.checkerCellSize;
  const cols = Math.max(1, Math.ceil(layout.width / cellSize));
  const rows = Math.max(1, Math.ceil(layout.height / cellSize));

  const cells = useMemo<GridCell[]>(() => {
    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;
    const spreadMs = Math.round(
      BUTTON_FEEDBACK.checkerTotalDurationMs * BUTTON_FEEDBACK.checkerSpreadRatio,
    );

    const unsortedCells: (Omit<GridCell, 'sequenceDelayMs'> & {
      distance: number;
    })[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const distance = Math.hypot(col - centerCol, row - centerRow);

        unsortedCells.push({
          id: `${row}-${col}`,
          row,
          col,
          left: col * cellSize,
          top: row * cellSize,
          distance,
        });
      }
    }

    // Center-out ordering with deterministic tie-breakers gives a true one-by-one reveal.
    const ordered = [...unsortedCells].sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    const stepMs = ordered.length > 1 ? spreadMs / (ordered.length - 1) : spreadMs;

    return ordered.map((cell, index) => ({
      id: cell.id,
      row: cell.row,
      col: cell.col,
      left: cell.left,
      top: cell.top,
      sequenceDelayMs: Math.min(spreadMs, Math.round(index * stepMs)),
    }));
  }, [cellSize, cols, rows]);

  useEffect(() => {
    return () => {
      runningAnimationRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (playSignal === 0 || cells.length === 0) return;

    runningAnimationRef.current?.stop();
    progress.setValue(0);

    const nextAnimation = Animated.timing(progress, {
      toValue: 1,
      duration: BUTTON_FEEDBACK.checkerTotalDurationMs,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    runningAnimationRef.current = nextAnimation;
    nextAnimation.start(() => {
      runningAnimationRef.current = null;
      progress.setValue(0);
    });
  }, [cells.length, playSignal, progress]);

  const tokens = getTokens();
  const lightPink = tokens.color[lightTokenKey].val;
  const darkPink = tokens.color[darkTokenKey].val;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) {
      setLayout({ width, height });
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[
        styles.overlay,
        {
          left: -bleedHorizontal,
          right: -bleedHorizontal,
        },
      ]}
    >
      {cells.map((cell) => {
        const totalMs = BUTTON_FEEDBACK.checkerTotalDurationMs;
        const spreadMs = Math.round(totalMs * BUTTON_FEEDBACK.checkerSpreadRatio);
        const activeMs = Math.max(60, totalMs - spreadMs);
        const rawStart = cell.sequenceDelayMs / totalMs;
        const peakMs = Math.round(activeMs * BUTTON_FEEDBACK.checkerPeakRatio);
        const settle1Ms = Math.round(activeMs * BUTTON_FEEDBACK.checkerSettle1Ratio);
        const settle2Ms = Math.round(activeMs * BUTTON_FEEDBACK.checkerSettle2Ratio);
        const endMs = activeMs;

        const rawPeak = (cell.sequenceDelayMs + peakMs) / totalMs;
        const rawSettle1 = (cell.sequenceDelayMs + settle1Ms) / totalMs;
        const rawSettle2 = (cell.sequenceDelayMs + settle2Ms) / totalMs;
        const rawEnd = (cell.sequenceDelayMs + endMs) / totalMs;

        const start = Math.min(1, Math.max(0, rawStart));
        const peak = Math.min(1, Math.max(start, rawPeak));
        const settle1 = Math.min(1, Math.max(peak, rawSettle1));
        const settle2 = Math.min(1, Math.max(settle1, rawSettle2));
        const end = Math.min(1, Math.max(settle2, rawEnd));
        const fadeEnd = Math.min(1, end + (1 - end) * BUTTON_FEEDBACK.checkerFadeTailRatio);

        const opacity = progress.interpolate({
          inputRange: [0, start, peak, end, fadeEnd, 1],
          outputRange: [
            0,
            0,
            BUTTON_FEEDBACK.checkerMaxOpacity,
            BUTTON_FEEDBACK.checkerMaxOpacity,
            0,
            0,
          ],
          extrapolate: 'clamp',
        });

        const scale = progress.interpolate({
          inputRange: [0, start, peak, settle1, settle2, end, fadeEnd, 1],
          outputRange: [
            0,
            BUTTON_FEEDBACK.checkerScaleMin,
            BUTTON_FEEDBACK.checkerBouncePeakScale,
            BUTTON_FEEDBACK.checkerBounceSettleScale1,
            BUTTON_FEEDBACK.checkerBounceSettleScale2,
            BUTTON_FEEDBACK.checkerScaleMax,
            BUTTON_FEEDBACK.checkerScaleMax,
            BUTTON_FEEDBACK.checkerScaleMax,
          ],
          extrapolate: 'clamp',
        });
        const cellColor = (cell.row + cell.col) % 2 === 0 ? lightPink : darkPink;

        return (
          <Animated.View
            key={cell.id}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                left: cell.left,
                top: cell.top,
                backgroundColor: cellColor,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cell: {
    position: 'absolute',
  },
});
