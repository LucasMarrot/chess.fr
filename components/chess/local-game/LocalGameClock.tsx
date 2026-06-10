import { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Text, XStack, getTokens } from 'tamagui';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CHESS_BUTTON_INTERACTION, CHESS_BUTTON_VARIANTS } from '@/constants/chess-button';

import { AnimatedClockIcon } from './AnimatedClockIcon';
import { localGameStyles } from './styles';
import type { LocalGameClockModel } from './types';
import { formatClock } from './utils';

type LocalGameClockProps = {
  clock: LocalGameClockModel;
  totalMs: number;
  maxWidth?: number;
};

export const LocalGameClock = ({ clock, totalMs, maxWidth }: LocalGameClockProps) => {
  const tokens = getTokens();
  const { width } = useWindowDimensions();
  const isBlackClock = clock.color === 'black';
  const variantConfig = isBlackClock
    ? CHESS_BUTTON_VARIANTS.primary
    : CHESS_BUTTON_VARIANTS.secondary;
  const depth = variantConfig.depth;
  const availableWidth = Math.max(112, maxWidth ?? width);
  const isCompact = width <= 390 || availableWidth <= 146;
  const isVeryCompact = width <= 350 || availableWidth <= 122;

  const verticalPadding = isVeryCompact ? 5 : isCompact ? 7 : 11;
  const horizontalPadding = isVeryCompact ? 7 : isCompact ? 11 : 15;
  const iconSize = isVeryCompact ? 16 : isCompact ? 18 : 20;
  const fontSize = isVeryCompact ? '$5' : isCompact ? '$6' : '$7';
  const gap = isVeryCompact ? 6 : isCompact ? 8 : 10;
  const preferredClockWidth = isVeryCompact ? 112 : isCompact ? 136 : 168;
  const clockWidth = Math.min(availableWidth, preferredClockWidth);
  const textWidth = Math.max(70, clockWidth - horizontalPadding * 2 - iconSize - gap);

  const isCritical = clock.clockMs <= 10_000;
  const normalBackgroundColor = String(tokens.color[variantConfig.surfaceToken].val);
  const normalContentColor = String(tokens.color[variantConfig.textToken].val);
  const normalBorderColor = String(tokens.color[depth.borderColorToken].val);
  const normalBorderTopSideColor = String(tokens.color[depth.borderTopSideColorToken].val);
  const normalEdgeColor = String(tokens.color[depth.edgeColorToken].val);
  const criticalBorderColor = String(tokens.color.danger.val);
  const shadowColor = String(tokens.color.dark.val);
  const activeRingColor = String(tokens.color.primaryDark.val);
  const normalRingColor = clock.isActive ? activeRingColor : normalContentColor;
  const textColor = normalContentColor;

  const scale = useSharedValue(1);
  const wasCriticalRef = useRef(isCritical);

  useEffect(() => {
    if (isCritical && !wasCriticalRef.current && clock.isActive) {
      scale.value = 1;
      scale.value = withSequence(
        withTiming(1.03, {
          duration: 100,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: 120,
          easing: Easing.inOut(Easing.quad),
        }),
      );
    }

    wasCriticalRef.current = isCritical;
  }, [clock.isActive, isCritical, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const safeTotalMs = Math.max(1, totalMs);
  const fillRatio = Math.max(0, Math.min(1, clock.clockMs / safeTotalMs));

  return (
    <Animated.View style={animatedStyle}>
      <XStack
        style={localGameStyles.clockCard}
        width={clockWidth}
        paddingVertical={verticalPadding}
        paddingHorizontal={horizontalPadding}
        borderColor={isCritical ? criticalBorderColor : normalBorderColor}
        borderTopColor={isCritical ? criticalBorderColor : normalBorderTopSideColor}
        borderLeftColor={isCritical ? criticalBorderColor : normalBorderTopSideColor}
        borderRightColor={isCritical ? criticalBorderColor : normalBorderTopSideColor}
        backgroundColor={normalBackgroundColor}
        borderBottomWidth={isCompact ? 2 : depth.bottomWidth}
        borderBottomColor={isCritical ? criticalBorderColor : normalEdgeColor}
        shadowColor={shadowColor}
        shadowOffset={{ width: 0, height: isCompact ? 1.5 : depth.shadowOffsetY }}
        shadowOpacity={depth.shadowOpacity}
        shadowRadius={isCompact ? 3 : depth.shadowRadius}
        elevation={isCompact ? 3 : CHESS_BUTTON_INTERACTION.defaultElevation}
        alignSelf="center"
        gap={gap}
      >
        <AnimatedClockIcon
          isActive={clock.isActive}
          fillRatio={fillRatio}
          color={normalRingColor}
          needleColor={normalRingColor}
          size={iconSize}
          strokeWidth={isCompact ? 2 : 2.2}
        />
        <Text
          color={textColor}
          fontFamily="$body"
          fontSize={fontSize}
          fontWeight="400"
          numberOfLines={1}
          textAlign="right"
          width={textWidth}
        >
          {formatClock(clock.clockMs)}
        </Text>
      </XStack>
    </Animated.View>
  );
};
