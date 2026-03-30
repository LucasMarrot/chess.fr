import { create } from 'zustand';

import type { CustomSquareStyles, Square } from '../chessboard-lib/types';

type LocalMoveTarget = {
  to: Square;
  isCapture: boolean;
};

type MoveOptionPalette = {
  quietFill: string;
  captureBorder: string;
  captureFill: string;
};

type LocalChessUiState = {
  selectedSquare: Square | null;
  optionSquares: CustomSquareStyles;
  isHistoryCollapsed: boolean;
  selectSquare: (square: Square | null) => void;
  showMoveOptions: (targets: LocalMoveTarget[], palette: MoveOptionPalette) => void;
  setHistoryCollapsed: (collapsed: boolean) => void;
  toggleHistoryCollapsed: () => void;
  clearSelection: () => void;
  resetUi: () => void;
};

export const useLocalChessUiStore = create<LocalChessUiState>((set) => ({
  selectedSquare: null,
  optionSquares: {},
  isHistoryCollapsed: false,

  selectSquare: (square) => {
    set({ selectedSquare: square });
  },

  showMoveOptions: (targets, palette) => {
    const styles: CustomSquareStyles = {};

    for (const target of targets) {
      styles[target.to] = target.isCapture
        ? {
            borderWidth: 2,
            borderColor: palette.captureBorder,
            backgroundColor: palette.captureFill,
            borderRadius: 999,
          }
        : {
            backgroundColor: palette.quietFill,
            height: 16,
            width: 16,
            borderRadius: 999,
          };
    }

    set({ optionSquares: styles });
  },

  setHistoryCollapsed: (collapsed) => {
    set({ isHistoryCollapsed: collapsed });
  },

  toggleHistoryCollapsed: () => {
    set((state) => ({ isHistoryCollapsed: !state.isHistoryCollapsed }));
  },

  clearSelection: () => {
    set({
      selectedSquare: null,
      optionSquares: {},
    });
  },

  resetUi: () => {
    set({
      selectedSquare: null,
      optionSquares: {},
      isHistoryCollapsed: false,
    });
  },
}));
