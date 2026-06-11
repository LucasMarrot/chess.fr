export type HistoryRow = {
  moveNumber: number;
  white: string;
  black: string;
};

export type LocalGameTheme = {
  light: string;
  dark: string;
  primary: string;
  interactionGrey: string;
  buttonPrimaryHover: string;
  buttonSecondaryBorder: string;
  primaryDark: string;
  danger: string;
  dangerDark: string;
  boardWoodLight: string;
  boardWoodDark: string;
  buttonPrimaryBorder: string;
  buttonSecondaryHover: string;
  moveOptionQuietFill: string;
  moveOptionCaptureFill: string;
  activeClockBackground: string;
  historyHeaderBackground: string;
  promotionOptionBackground: string;
  overlayBackdrop: string;
  endOverlayBackdrop: string;
  captureFlashBorder: string;
  captureFlashBackground: string;
  lastMoveFromBackground: string;
  lastMoveToBackground: string;
  checkBorder: string;
  checkmateBackground: string;
};

export type LocalGameClockModel = {
  color: 'black' | 'white';
  clockMs: number;
  isActive: boolean;
  isUpsideDown: boolean;
};
