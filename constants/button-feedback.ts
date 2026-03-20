export const BUTTON_FEEDBACK = {
  checkerTokens: {
    darkSurface: {
      light: 'primaryDark' as const,
      dark: 'dark' as const,
    },
    lightSurface: {
      light: 'light' as const,
      dark: 'primaryDark' as const,
    },
  },
  checkerCellSize: 8,
  checkerMaxOpacity: 0.32,
  checkerTotalDurationMs: 520,
  checkerSpreadRatio: 0.7,
  checkerPeakRatio: 0.36,
  checkerSettle1Ratio: 0.58,
  checkerSettle2Ratio: 0.76,
  checkerFadeTailRatio: 0.7,
  checkerScaleMin: 0.4,
  checkerBouncePeakScale: 1.28,
  checkerBounceSettleScale1: 0.86,
  checkerBounceSettleScale2: 1.06,
  checkerScaleMax: 0.8,
  cursorPointer: 'pointer' as const,
  cursorDisabled: 'not-allowed' as const,
};

export type CheckerTokenKey =
  | (typeof BUTTON_FEEDBACK.checkerTokens.darkSurface)[keyof typeof BUTTON_FEEDBACK.checkerTokens.darkSurface]
  | (typeof BUTTON_FEEDBACK.checkerTokens.lightSurface)[keyof typeof BUTTON_FEEDBACK.checkerTokens.lightSurface];
