import { memo, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
  isLightCell: boolean;
  start: number;
  peak: number;
  settle1: number;
  settle2: number;
  end: number;
  fadeEnd: number;
};

type CheckerCellProps = {
  cell: GridCell;
  cellSize: number;
  lightColor: string;
  darkColor: string;
  progress: SharedValue<number>;
};

const CheckerCell = memo(function CheckerCell({
  cell,
  cellSize,
  lightColor,
  darkColor,
  progress,
}: CheckerCellProps) {
  const cellColor = cell.isLightCell ? lightColor : darkColor;

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, cell.start, cell.peak, cell.end, cell.fadeEnd, 1],
      [0, 0, BUTTON_FEEDBACK.checkerMaxOpacity, BUTTON_FEEDBACK.checkerMaxOpacity, 0, 0],
      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      progress.value,
      [0, cell.start, cell.peak, cell.settle1, cell.settle2, cell.end, cell.fadeEnd, 1],
      [
        0,
        BUTTON_FEEDBACK.checkerScaleMin,
        BUTTON_FEEDBACK.checkerBouncePeakScale,
        BUTTON_FEEDBACK.checkerBounceSettleScale1,
        BUTTON_FEEDBACK.checkerBounceSettleScale2,
        BUTTON_FEEDBACK.checkerScaleMax,
        BUTTON_FEEDBACK.checkerScaleMax,
        BUTTON_FEEDBACK.checkerScaleMax,
      ],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  }, [cell]);

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          left: cell.left,
          top: cell.top,
          backgroundColor: cellColor,
        },
        animatedStyle,
      ]}
    />
  );
});

export function CheckerboardPressFeedback({
  playSignal,
  bleedHorizontal = 0,
  lightTokenKey = BUTTON_FEEDBACK.checkerTokens.darkSurface.light,
  darkTokenKey = BUTTON_FEEDBACK.checkerTokens.darkSurface.dark,
}: CheckerboardPressFeedbackProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);
  const baseCellSize = BUTTON_FEEDBACK.checkerCellSize;
  const maxCells = BUTTON_FEEDBACK.checkerMaxCells;

  const cellSize = useMemo(() => {
    const { width, height } = layout;
    if (width <= 0 || height <= 0) return baseCellSize;

    const area = width * height;
    const adaptiveSize = Math.ceil(Math.sqrt(area / maxCells));
    return Math.max(baseCellSize, adaptiveSize);
  }, [baseCellSize, layout, maxCells]);

  const cols = Math.max(1, Math.ceil(layout.width / cellSize));
  const rows = Math.max(1, Math.ceil(layout.height / cellSize));

  const cells = useMemo<GridCell[]>(() => {
    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;
    const spreadMs = Math.round(
      BUTTON_FEEDBACK.checkerTotalDurationMs * BUTTON_FEEDBACK.checkerSpreadRatio,
    );

    const unsortedCells: (Omit<
      GridCell,
      'isLightCell' | 'start' | 'peak' | 'settle1' | 'settle2' | 'end' | 'fadeEnd'
    > & {
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

    const totalMs = BUTTON_FEEDBACK.checkerTotalDurationMs;
    const activeMs = Math.max(60, totalMs - spreadMs);
    const peakMs = Math.round(activeMs * BUTTON_FEEDBACK.checkerPeakRatio);
    const settle1Ms = Math.round(activeMs * BUTTON_FEEDBACK.checkerSettle1Ratio);
    const settle2Ms = Math.round(activeMs * BUTTON_FEEDBACK.checkerSettle2Ratio);
    const endMs = activeMs;

    return ordered.map((cell, index) => {
      const sequenceDelayMs = Math.min(spreadMs, Math.round(index * stepMs));
      const rawStart = sequenceDelayMs / totalMs;
      const rawPeak = (sequenceDelayMs + peakMs) / totalMs;
      const rawSettle1 = (sequenceDelayMs + settle1Ms) / totalMs;
      const rawSettle2 = (sequenceDelayMs + settle2Ms) / totalMs;
      const rawEnd = (sequenceDelayMs + endMs) / totalMs;

      const start = Math.min(1, Math.max(0, rawStart));
      const peak = Math.min(1, Math.max(start, rawPeak));
      const settle1 = Math.min(1, Math.max(peak, rawSettle1));
      const settle2 = Math.min(1, Math.max(settle1, rawSettle2));
      const end = Math.min(1, Math.max(settle2, rawEnd));
      const fadeEnd = Math.min(1, end + (1 - end) * BUTTON_FEEDBACK.checkerFadeTailRatio);

      return {
        id: cell.id,
        row: cell.row,
        col: cell.col,
        left: cell.left,
        top: cell.top,
        isLightCell: (cell.row + cell.col) % 2 === 0,
        start,
        peak,
        settle1,
        settle2,
        end,
        fadeEnd,
      };
    });
  }, [cellSize, cols, rows]);

  useEffect(() => {
    if (playSignal === 0 || cells.length === 0) return;

    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: BUTTON_FEEDBACK.checkerTotalDurationMs,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          progress.value = 0;
        }
      },
    );
  }, [cells.length, playSignal, progress]);

  const tokens = getTokens();
  const lightPink = tokens.color[lightTokenKey].val;
  const darkPink = tokens.color[darkTokenKey].val;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) => {
      if (width === prev.width && height === prev.height) return prev;
      return { width, height };
    });
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
      {cells.map((cell) => (
        <CheckerCell
          key={cell.id}
          cell={cell}
          cellSize={cellSize}
          lightColor={lightPink}
          darkColor={darkPink}
          progress={progress}
        />
      ))}
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
