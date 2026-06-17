import React, { useMemo, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { Button, Spinner, Text, XStack, YStack, getTokens, styled } from 'tamagui';
import { BUTTON_FEEDBACK } from '@/constants/button-feedback';
import {
  CHESS_BUTTON_INTERACTION,
  CHESS_BUTTON_SIZES,
  CHESS_BUTTON_VARIANTS,
  ChessButtonSize,
  ChessButtonVariant,
} from '@/constants/chess-button';
import { CheckerboardPressFeedback } from '@/components/ui/CheckerboardPressFeedback';

type ChessButtonShape = 'default' | 'circle';

interface ChessButtonProps {
  variant?: ChessButtonVariant;
  size?: ChessButtonSize;
  shape?: ChessButtonShape;
  selected?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  flex?: number;
  iconLeft?: React.ReactNode;
  textProps?: React.ComponentProps<typeof Text>;
  href?: Href;
  replace?: boolean;
}

const StyledChessButton = styled(Button, {
  name: 'ChessButton',
  unstyled: true,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  variants: {
    fullWidth: {
      true: {
        width: '100%',
      },
    },
    shape: {
      default: {},
      circle: {
        borderRadius: 999,
      },
    },
  } as const,
});

const StyledButtonLabel = styled(Text, {
  name: 'ChessButtonLabel',
  fontFamily: '$body',
  fontWeight: '600',
});

export const ChessButton = ({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  selected = false,
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  flex,
  iconLeft,
  textProps,
  href,
  replace = false,
}: ChessButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [feedbackSignal, setFeedbackSignal] = useState(0);
  const router = useRouter();

  const tokens = getTokens();
  const darkColor = tokens.color.dark.val;
  const accentColor = tokens.color.primary.val;

  const isInteractionDisabled = disabled || loading;
  const isActionDisabled = isInteractionDisabled;
  const isGhost = variant === 'ghost';
  const buttonSize = CHESS_BUTTON_SIZES[size] ?? CHESS_BUTTON_SIZES.md;
  const isIconOnly = size === 'icon' || size === 'iconLg';
  const variantConfig = CHESS_BUTTON_VARIANTS[variant] ?? CHESS_BUTTON_VARIANTS.primary;
  const useSelectedPalette = selected && (variant === 'selectableCard' || shape === 'circle');
  const borderRadius =
    shape === 'circle' || variant === 'rounded' ? 999 : CHESS_BUTTON_INTERACTION.radiusToken;
  const depth = variantConfig.depth;
  const backgroundColor =
    tokens.color[useSelectedPalette ? 'dark' : variantConfig.surfaceToken].val;
  const textColor = tokens.color[useSelectedPalette ? 'light' : variantConfig.textToken].val;
  const hoverColor =
    tokens.color[useSelectedPalette ? 'buttonPrimaryHover' : variantConfig.hoverToken].val;
  const borderColor =
    tokens.color[useSelectedPalette ? 'buttonPrimaryBorder' : depth.borderColorToken].val;
  const borderTopSideColor =
    tokens.color[useSelectedPalette ? 'buttonPrimaryBorderTop' : depth.borderTopSideColorToken].val;
  const edgeColor =
    tokens.color[useSelectedPalette ? 'buttonPrimaryEdge' : depth.edgeColorToken].val;

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
    isGhost,
  ]);

  return (
    <StyledChessButton
      onPress={() => {
        if (isActionDisabled) return;
        if (href) {
          if (replace) router.replace(href);
          else router.push(href);
        }
        onPress?.();
      }}
      shape={shape}
      disabled={isInteractionDisabled}
      fullWidth={shape === 'circle' ? false : fullWidth}
      onPressIn={() => {
        if (isInteractionDisabled) return;
        setIsPressed(true);
        setFeedbackSignal((value) => value + 1);
      }}
      onPressOut={() => {
        if (isInteractionDisabled) return;
        setIsPressed(false);
      }}
      borderRadius={borderRadius}
      height={buttonSize.height}
      flex={flex}
      paddingHorizontal={
        isIconOnly || shape === 'circle'
          ? CHESS_BUTTON_INTERACTION.iconHorizontalPaddingWhenIconOnly
          : buttonSize.horizontalPadding
      }
      width={shape === 'circle' ? buttonSize.height : undefined}
      minWidth={isIconOnly || shape === 'circle' ? buttonSize.height : flex ? 0 : undefined}
      cursor={isActionDisabled ? BUTTON_FEEDBACK.cursorDisabled : BUTTON_FEEDBACK.cursorPointer}
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
      shadowColor={colors.shadowColor}
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
          isIconOnly || shape === 'circle'
            ? CHESS_BUTTON_INTERACTION.iconHorizontalPaddingWhenIconOnly
            : buttonSize.horizontalPadding
        }
        lightTokenKey={
          useSelectedPalette || variant === 'primary'
            ? BUTTON_FEEDBACK.checkerTokens.darkSurface.light
            : BUTTON_FEEDBACK.checkerTokens.lightSurface.light
        }
        darkTokenKey={
          useSelectedPalette || variant === 'primary'
            ? BUTTON_FEEDBACK.checkerTokens.darkSurface.dark
            : BUTTON_FEEDBACK.checkerTokens.lightSurface.dark
        }
      />

      {loading ? (
        <Spinner color={accentColor} size="small" />
      ) : (
        <XStack alignItems="center" justifyContent="center" gap="$2">
          {iconLeft ? (
            <YStack
              width={buttonSize.iconSize}
              height={buttonSize.iconSize}
              alignItems="center"
              justifyContent="center"
            >
              {iconLeft}
            </YStack>
          ) : null}
          {!isIconOnly ? (
            <StyledButtonLabel
              color={colors.textColor}
              fontSize={buttonSize.textSize}
              {...textProps}
            >
              {children}
            </StyledButtonLabel>
          ) : null}
        </XStack>
      )}
    </StyledChessButton>
  );
};
