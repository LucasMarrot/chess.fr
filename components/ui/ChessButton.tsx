import React, { useMemo, useState } from 'react';
import { Button, Spinner, Text, XStack, YStack, getTokens } from 'tamagui';
import { BUTTON_FEEDBACK } from '@/constants/button-feedback';
import {
  CHESS_BUTTON_INTERACTION,
  CHESS_BUTTON_SIZES,
  CHESS_BUTTON_VARIANTS,
  ChessButtonSize,
  ChessButtonVariant,
} from '@/constants/chess-button';
import { CheckerboardPressFeedback } from '@/components/ui/CheckerboardPressFeedback';

interface ChessButtonProps {
  variant?: ChessButtonVariant;
  size?: ChessButtonSize;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  textProps?: React.ComponentProps<typeof Text>;
}

export const ChessButton = ({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  textProps,
}: ChessButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [feedbackSignal, setFeedbackSignal] = useState(0);

  const tokens = getTokens();
  const darkColor = tokens.color.dark.val;
  const accentColor = tokens.color.primary.val;

  const isInteractionDisabled = disabled;
  const isActionDisabled = disabled || loading;
  const buttonSize = CHESS_BUTTON_SIZES[size];
  const variantConfig = CHESS_BUTTON_VARIANTS[variant];
  const borderRadius = variant === 'rounded' ? 999 : CHESS_BUTTON_INTERACTION.radiusToken;
  const depth = variantConfig.depth;
  const backgroundColor = tokens.color[variantConfig.surfaceToken].val;
  const textColor = tokens.color[variantConfig.textToken].val;
  const hoverColor = tokens.color[variantConfig.hoverToken].val;
  const borderColor = tokens.color[depth.borderColorToken].val;
  const borderTopSideColor = tokens.color[depth.borderTopSideColorToken].val;
  const edgeColor = tokens.color[depth.edgeColorToken].val;

  const colors = useMemo(() => {
    return {
      backgroundColor,
      textColor,
      borderColor,
      borderTopSideColor,
      edgeColor,
      shadowColor: darkColor,
      hoverColor,
      focusRingColor: accentColor,
    };
  }, [
    backgroundColor,
    textColor,
    borderColor,
    borderTopSideColor,
    edgeColor,
    hoverColor,
    darkColor,
    accentColor,
  ]);

  return (
    <Button
      unstyled
      onPress={() => {
        if (isActionDisabled) return;
        onPress?.();
      }}
      disabled={isInteractionDisabled}
      onPressIn={() => {
        setIsPressed(true);
        setFeedbackSignal((value) => value + 1);
      }}
      onPressOut={() => {
        setIsPressed(false);
      }}
      borderRadius={borderRadius}
      height={buttonSize.height}
      paddingHorizontal={
        size === 'icon'
          ? CHESS_BUTTON_INTERACTION.iconHorizontalPaddingWhenIconOnly
          : buttonSize.horizontalPadding
      }
      width={fullWidth ? '100%' : undefined}
      minWidth={size === 'icon' ? buttonSize.height : undefined}
      cursor={isActionDisabled ? BUTTON_FEEDBACK.cursorDisabled : BUTTON_FEEDBACK.cursorPointer}
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      backgroundColor={colors.backgroundColor}
      borderWidth={CHESS_BUTTON_INTERACTION.borderWidth}
      borderColor={colors.borderColor}
      borderTopColor={colors.borderTopSideColor}
      borderLeftColor={colors.borderTopSideColor}
      borderRightColor={colors.borderTopSideColor}
      borderBottomWidth={
        isPressed ? CHESS_BUTTON_INTERACTION.pressedBorderBottomWidth : depth.bottomWidth
      }
      borderBottomColor={colors.edgeColor}
      opacity={isActionDisabled ? CHESS_BUTTON_INTERACTION.disabledOpacity : 1}
      shadowColor={colors.shadowColor}
      shadowOffset={{
        width: 0,
        height: isPressed ? CHESS_BUTTON_INTERACTION.pressedShadowOffsetY : depth.shadowOffsetY,
      }}
      shadowOpacity={
        isPressed ? CHESS_BUTTON_INTERACTION.pressedShadowOpacity : depth.shadowOpacity
      }
      shadowRadius={isPressed ? CHESS_BUTTON_INTERACTION.pressedShadowRadius : depth.shadowRadius}
      elevation={
        isPressed
          ? CHESS_BUTTON_INTERACTION.pressedElevation
          : CHESS_BUTTON_INTERACTION.defaultElevation
      }
      transform={isPressed ? [{ translateY: depth.pressTranslateY }] : undefined}
      hoverStyle={{
        backgroundColor: colors.hoverColor,
      }}
      focusVisibleStyle={{
        outlineColor: colors.focusRingColor,
        outlineWidth: CHESS_BUTTON_INTERACTION.focusOutlineWidth,
        outlineStyle: 'solid',
      }}
      pressStyle={{
        backgroundColor: colors.backgroundColor,
      }}
    >
      <CheckerboardPressFeedback
        playSignal={feedbackSignal}
        bleedHorizontal={
          size === 'icon'
            ? CHESS_BUTTON_INTERACTION.iconHorizontalPaddingWhenIconOnly
            : buttonSize.horizontalPadding
        }
        lightTokenKey={
          variant === 'primary'
            ? BUTTON_FEEDBACK.checkerTokens.darkSurface.light
            : BUTTON_FEEDBACK.checkerTokens.lightSurface.light
        }
        darkTokenKey={
          variant === 'primary'
            ? BUTTON_FEEDBACK.checkerTokens.darkSurface.dark
            : BUTTON_FEEDBACK.checkerTokens.lightSurface.dark
        }
      />

      {loading ? (
        <Spinner color={accentColor} size="small" />
      ) : (
        <XStack alignItems="center" justifyContent="center" gap="$2">
          {iconLeft ? <YStack width={buttonSize.iconSize}>{iconLeft}</YStack> : null}
          {size !== 'icon' ? (
            <Text
              color={colors.textColor}
              fontFamily="$body"
              fontWeight="600"
              fontSize={buttonSize.textSize}
              {...textProps}
            >
              {children}
            </Text>
          ) : null}
        </XStack>
      )}
    </Button>
  );
};
