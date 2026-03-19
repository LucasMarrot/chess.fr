export type ChessButtonVariant = 'primary' | 'secondary';
export type ChessButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type ChessButtonTextSize = '$3' | '$4' | '$5';
export type ChessButtonTokenColor =
  | 'dark'
  | 'light'
  | 'primary'
  | 'buttonPrimaryHover'
  | 'buttonSecondaryHover'
  | 'buttonPrimaryBorder'
  | 'buttonPrimaryBorderTop'
  | 'buttonPrimaryEdge'
  | 'buttonSecondaryBorder'
  | 'buttonSecondaryBorderTop'
  | 'buttonSecondaryEdge';

export interface ChessButtonSizeConfig {
  height: number;
  horizontalPadding: number;
  textSize: ChessButtonTextSize;
  iconSize: number;
}

export interface ChessButtonDepthConfig {
  borderColorToken: ChessButtonTokenColor;
  borderTopSideColorToken: ChessButtonTokenColor;
  edgeColorToken: ChessButtonTokenColor;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
  bottomWidth: number;
  pressTranslateY: number;
}

export interface ChessButtonVariantConfig {
  surfaceToken: ChessButtonTokenColor;
  textToken: ChessButtonTokenColor;
  hoverToken: ChessButtonTokenColor;
  depth: ChessButtonDepthConfig;
}

export const CHESS_BUTTON_SIZES: Record<ChessButtonSize, ChessButtonSizeConfig> = {
  sm: { height: 40, horizontalPadding: 14, textSize: '$3', iconSize: 16 },
  md: { height: 48, horizontalPadding: 18, textSize: '$4', iconSize: 18 },
  lg: { height: 56, horizontalPadding: 22, textSize: '$5', iconSize: 20 },
  icon: { height: 40, horizontalPadding: 10, textSize: '$3', iconSize: 18 },
};

export const CHESS_BUTTON_INTERACTION = {
  radiusToken: '$3' as const,
  disabledOpacity: 0.55,
  pressedBorderBottomWidth: 1,
  pressedShadowOpacity: 0.22,
  pressedShadowRadius: 2,
  pressedShadowOffsetY: 1,
  pressedElevation: 1,
  defaultElevation: 4,
  borderWidth: 1,
  focusOutlineWidth: 2,
  overlayPressedOpacity: 0.12,
  overlayLoadingOpacity: 0.2,
  iconHorizontalPaddingWhenIconOnly: 0,
};

export const CHESS_BUTTON_VARIANTS: Record<ChessButtonVariant, ChessButtonVariantConfig> = {
  primary: {
    surfaceToken: 'dark',
    textToken: 'light',
    hoverToken: 'buttonPrimaryHover',
    depth: {
      borderColorToken: 'buttonPrimaryBorder',
      borderTopSideColorToken: 'buttonPrimaryBorderTop',
      edgeColorToken: 'buttonPrimaryEdge',
      shadowOpacity: 0.4,
      shadowRadius: 4,
      shadowOffsetY: 2,
      bottomWidth: 3,
      pressTranslateY: 2,
    },
  },
  secondary: {
    surfaceToken: 'light',
    textToken: 'dark',
    hoverToken: 'buttonSecondaryHover',
    depth: {
      borderColorToken: 'buttonSecondaryBorder',
      borderTopSideColorToken: 'buttonSecondaryBorderTop',
      edgeColorToken: 'buttonSecondaryEdge',
      shadowOpacity: 0.32,
      shadowRadius: 4,
      shadowOffsetY: 2,
      bottomWidth: 3,
      pressTranslateY: 2,
    },
  },
};
