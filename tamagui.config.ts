import { createAnimations } from '@tamagui/animations-react-native';
import { createFont, createTamagui, createTokens } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

const { size, space, zIndex } = defaultConfig.tokens;

const loraFont = createFont({
  family: 'Lora',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, true: 16 },
  weight: { 1: '400', 3: '500', 5: '600', 7: '700', true: '400' },
  lineHeight: { 1: 18, 2: 22, 3: 24, 4: 26, 5: 30, 6: 36, 7: 48, 8: 60, 9: 72, true: 24 },
  letterSpacing: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, true: 0 },
  face: {
    400: { normal: 'Lora_400Regular' },
    500: { normal: 'Lora_500Medium' },
    600: { normal: 'Lora_600SemiBold' },
    700: { normal: 'Lora_700Bold' },
  },
});

const animations = createAnimations({
  interaction: {
    type: 'timing',
    duration: 150,
  },
  programmatic: {
    type: 'spring',
    tension: 100,
    friction: 15,
  },
});

const tokens = createTokens({
  color: {
    dark: '#332E2F',
    light: '#FFFAFB',
    primary: '#FAE0E4',
    primaryDark: '#D893A2',
    danger: '#B93638',
    dangerDark: '#7F1D1D',
    boardWoodLight: '#EBD8B5',
    boardWoodDark: '#B88B5D',
    interactionGrey: '#7A7677',
    buttonPrimaryHover: '#272223',
    buttonSecondaryHover: '#F2F0F1',
    buttonPrimaryBorder: '#5E595A',
    buttonPrimaryBorderTop: '#6B6667',
    buttonPrimaryEdge: '#6B6667',
    buttonSecondaryBorder: '#332E2F',
    buttonSecondaryBorderTop: '#332E2F',
    buttonSecondaryEdge: '#332E2F',
    transparent: 'rgba(0,0,0,0)',
  },
  space,
  size,
  radius: { 0: 0, 1: 4, 2: 6, 3: 8, 4: 12, 5: 16, true: 6 },
  zIndex,
});

const themes = {
  light: {
    background: tokens.color.light,
    color: tokens.color.dark,
    borderColor: tokens.color.dark,
    backgroundPress: tokens.color.light,
    backgroundHover: tokens.color.light,
    colorTransparent: tokens.color.transparent,
    backgroundTransparent: tokens.color.transparent,
  },
  dark: {
    background: tokens.color.dark,
    color: tokens.color.light,
    borderColor: tokens.color.light,
    backgroundPress: tokens.color.dark,
    backgroundHover: tokens.color.dark,
    colorTransparent: tokens.color.transparent,
    backgroundTransparent: tokens.color.transparent,
  },
  light_Primary: {
    background: tokens.color.dark,
    color: tokens.color.light,
  },
  light_Secondary: {
    background: tokens.color.transparent,
    color: tokens.color.dark,
  },
  dark_Primary: {
    background: tokens.color.light,
    color: tokens.color.dark,
  },
  dark_Secondary: {
    background: tokens.color.transparent,
    color: tokens.color.light,
  },
};

const config = createTamagui({
  animations,
  fonts: { heading: loraFont, body: loraFont },
  tokens,
  themes,
  shorthands: {
    bg: 'backgroundColor',
    p: 'padding',
    m: 'margin',
    w: 'width',
    h: 'height',
    br: 'borderRadius',
  } as const,
});

type Conf = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
