import React, { useMemo, useState } from 'react';
import { Button, Spinner, Text, XStack, YStack, getTokens, useThemeName } from 'tamagui';
import {
  CHESS_BUTTON_INTERACTION,
  CHESS_BUTTON_SIZES,
  CHESS_BUTTON_VARIANTS,
  ChessButtonSize,
  ChessButtonVariant,
} from '@/constants/chess-button';

interface ChessButtonProps {
  variant?: ChessButtonVariant;
  size?: ChessButtonSize;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
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
}: ChessButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const themeName = useThemeName();
  const isDarkTheme = themeName?.startsWith('dark');

  const tokens = getTokens();
  const darkColor = tokens.color.dark.val;
  const lightColor = tokens.color.light.val;
  const primaryAccent = tokens.color.primary.val;

  const isDisabled = disabled || loading;
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
      shadowColor: isDarkTheme ? lightColor : darkColor,
      hoverColor,
      focusRingColor: primaryAccent,
      accentOverlay: primaryAccent,
    };
  }, [
    backgroundColor,
    textColor,
    borderColor,
    borderTopSideColor,
    edgeColor,
    hoverColor,
    isDarkTheme,
    darkColor,
    lightColor,
    primaryAccent,
  ]);

  return (
    <Button
      unstyled
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      borderRadius={CHESS_BUTTON_INTERACTION.radiusToken}
      height={buttonSize.height}
      paddingHorizontal={
        size === 'icon'
          ? CHESS_BUTTON_INTERACTION.iconHorizontalPaddingWhenIconOnly
          : buttonSize.horizontalPadding
      }
      width={fullWidth ? '100%' : undefined}
      minWidth={size === 'icon' ? buttonSize.height : undefined}
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
      opacity={isDisabled ? CHESS_BUTTON_INTERACTION.disabledOpacity : 1}
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
      {(isPressed || loading) && (
        <YStack
          pointerEvents="none"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          backgroundColor={colors.accentOverlay}
          opacity={
            loading
              ? CHESS_BUTTON_INTERACTION.overlayLoadingOpacity
              : CHESS_BUTTON_INTERACTION.overlayPressedOpacity
          }
        />
      )}

      {loading ? (
        <Spinner color={primaryAccent} size="small" />
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
