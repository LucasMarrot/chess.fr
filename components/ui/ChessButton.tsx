import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import { useRouter, type Href } from 'expo-router';

interface ChessButtonProps {
  variant?: ChessButtonVariant;
  size?: ChessButtonSize;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  href?: Href;
  replace?: boolean;
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
                              href,
                              replace,
                            }: ChessButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [feedbackSignal, setFeedbackSignal] = useState(0);

  const router = useRouter();
  const pressInTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tokens = getTokens();
  const darkColor = tokens.color.dark.val;
  const accentColor = tokens.color.primary.val;

  const isInteractionDisabled = disabled;
  const isActionDisabled = disabled || loading;
  const isGhost = variant === 'ghost';
  const buttonSize = CHESS_BUTTON_SIZES[size];
  const variantConfig = CHESS_BUTTON_VARIANTS[variant];
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
      shadowColor: isGhost ? 'transparent' : darkColor,
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

  const handlePress = () => {
    if (isActionDisabled) return;

    if (href) {
      const timeElapsed = Date.now() - pressInTimeRef.current + 100;
      const remainingTime = Math.max(0, BUTTON_FEEDBACK.checkerTotalDurationMs - timeElapsed);

      const performNavigation = () => {
        if (replace) router.replace(href);
        else router.push(href);

        onPress?.(); // On appelle aussi onPress au cas où tu en aurais besoin pour de l'analytique
      };

      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(performNavigation, remainingTime);
      } else {
        performNavigation();
      }
    } else {
      // MODE ACTION NORMALE : On exécute instantanément
      onPress?.();
    }
  };

  return (
    <Button
      unstyled
      onPress={handlePress}
      disabled={isInteractionDisabled}
      onPressIn={() => {
        pressInTimeRef.current = Date.now();
        setIsPressed(true);
        setFeedbackSignal((value) => value + 1);
      }}
      onPressOut={() => {
        setIsPressed(false);
      }}
      borderRadius={CHESS_BUTTON_INTERACTION.radiusToken}
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
      borderWidth={isGhost ? 0 : CHESS_BUTTON_INTERACTION.borderWidth}
      borderColor={colors.borderColor}
      borderTopColor={colors.borderTopSideColor}
      borderLeftColor={colors.borderTopSideColor}
      borderRightColor={colors.borderTopSideColor}
      borderBottomWidth={
        isGhost
          ? 0
          : isPressed
            ? CHESS_BUTTON_INTERACTION.pressedBorderBottomWidth
            : depth.bottomWidth
      }
      borderBottomColor={colors.edgeColor}
      opacity={isActionDisabled ? CHESS_BUTTON_INTERACTION.disabledOpacity : 1}
      shadowOffset={{
        width: 0,
        height: isGhost
          ? 0
          : isPressed
            ? CHESS_BUTTON_INTERACTION.pressedShadowOffsetY
            : depth.shadowOffsetY,
      }}
      shadowOpacity={
        isGhost
          ? 0
          : isPressed
            ? CHESS_BUTTON_INTERACTION.pressedShadowOpacity
            : depth.shadowOpacity
      }
      shadowRadius={
        isGhost ? 0 : isPressed ? CHESS_BUTTON_INTERACTION.pressedShadowRadius : depth.shadowRadius
      }
      elevation={
        isGhost
          ? 0
          : isPressed
            ? CHESS_BUTTON_INTERACTION.pressedElevation
            : CHESS_BUTTON_INTERACTION.defaultElevation
      }
      transform={isPressed && !isGhost ? [{ translateY: depth.pressTranslateY }] : undefined}
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
            >
              {children}
            </Text>
          ) : null}
        </XStack>
      )}
    </Button>
  );
};
