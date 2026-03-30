import { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { View, getTokens } from 'tamagui';
import { useShallow } from 'zustand/react/shallow';

import type { LocalTimeControlPreset } from '@/constants/local-time-controls';

import type { ClearPremoves } from './ChessBoard';
import { LocalGameBoardSection } from './local-game/LocalGameBoardSection';
import { LocalGameHistoryPanel } from './local-game/LocalGameHistoryPanel';
import { LocalGamePromotionOverlay } from './local-game/LocalGamePromotionOverlay';
import { LocalGameResultOverlay } from './local-game/LocalGameResultOverlay';
import { LocalGameStatusCard } from './local-game/LocalGameStatusCard';
import { localGameStyles } from './local-game/styles';
import type { LocalGameTheme } from './local-game/types';
import {
  colorToLabel,
  getSquareTopLeft,
  resultReasonToLabel,
  toHistoryRows,
  withAlpha,
} from './local-game/utils';
import type { Piece, Square } from './chessboard-lib/types';
import { getPromotionOptions, useLocalChessGameStore } from './stores/use-local-chess-game-store';
import { useLocalChessUiStore } from './stores/use-local-chess-ui-store';

type LocalChessGameProps = {
  timeControl: LocalTimeControlPreset;
  onExit: () => void;
};

export const LocalChessGame = ({ timeControl, onExit }: LocalChessGameProps) => {
  const chessboardRef = useRef<ClearPremoves>(null);
  const tokens = getTokens();
  const { width } = useWindowDimensions();

  const uiTheme = useMemo<LocalGameTheme>(
    () => ({
      light: String(tokens.color.light.val),
      dark: String(tokens.color.dark.val),
      primary: String(tokens.color.primary.val),
      interactionGrey: String(tokens.color.interactionGrey.val),
      primaryDark: String(tokens.color.primaryDark.val),
      danger: String(tokens.color.danger.val),
      dangerDark: String(tokens.color.dangerDark.val),
      boardWoodLight: String(tokens.color.boardWoodLight.val),
      boardWoodDark: String(tokens.color.boardWoodDark.val),
      buttonPrimaryBorder: String(tokens.color.buttonPrimaryBorder.val),
      buttonSecondaryHover: String(tokens.color.buttonSecondaryHover.val),
      moveOptionQuietFill: withAlpha(String(tokens.color.primaryDark.val), 0.44),
      moveOptionCaptureFill: withAlpha(String(tokens.color.primary.val), 0.34),
      activeClockBackground: withAlpha(String(tokens.color.primary.val), 0.56),
      historyHeaderBackground: withAlpha(String(tokens.color.primary.val), 0.26),
      promotionOptionBackground: withAlpha(String(tokens.color.primary.val), 0.25),
      overlayBackdrop: withAlpha(String(tokens.color.dark.val), 0.55),
      endOverlayBackdrop: withAlpha(String(tokens.color.dark.val), 0.72),
      captureFlashBorder: withAlpha(String(tokens.color.primaryDark.val), 0.9),
      captureFlashBackground: withAlpha(String(tokens.color.primary.val), 0.58),
      lastMoveFromBackground: withAlpha(String(tokens.color.primaryDark.val), 0.22),
      lastMoveToBackground: withAlpha(String(tokens.color.primaryDark.val), 0.34),
      checkBorder: withAlpha(String(tokens.color.danger.val), 0.95),
      checkmateBackground: withAlpha(String(tokens.color.danger.val), 0.86),
    }),
    [tokens],
  );

  const {
    fen,
    turn,
    boardOrientation,
    status,
    result,
    pendingPromotion,
    config,
    moveHistory,
    lastMove,
    whiteKingSquare,
    blackKingSquare,
    clocks,
    startGame,
    resetGame,
    tickClock,
    flipBoard,
    attemptMove,
    cancelPromotion,
    confirmPromotion,
    getLegalTargets,
  } = useLocalChessGameStore(
    useShallow((state) => ({
      fen: state.fen,
      turn: state.turn,
      boardOrientation: state.boardOrientation,
      status: state.status,
      result: state.result,
      pendingPromotion: state.pendingPromotion,
      config: state.config,
      moveHistory: state.moveHistory,
      lastMove: state.lastMove,
      whiteKingSquare: state.whiteKingSquare,
      blackKingSquare: state.blackKingSquare,
      clocks: state.clocks,
      startGame: state.startGame,
      resetGame: state.resetGame,
      tickClock: state.tickClock,
      flipBoard: state.flipBoard,
      attemptMove: state.attemptMove,
      cancelPromotion: state.cancelPromotion,
      confirmPromotion: state.confirmPromotion,
      getLegalTargets: state.getLegalTargets,
    })),
  );

  const {
    selectedSquare,
    optionSquares,
    isHistoryCollapsed,
    selectSquare,
    showMoveOptions,
    clearSelection,
    toggleHistoryCollapsed,
    resetUi,
  } = useLocalChessUiStore(
    useShallow((state) => ({
      selectedSquare: state.selectedSquare,
      optionSquares: state.optionSquares,
      isHistoryCollapsed: state.isHistoryCollapsed,
      selectSquare: state.selectSquare,
      showMoveOptions: state.showMoveOptions,
      clearSelection: state.clearSelection,
      toggleHistoryCollapsed: state.toggleHistoryCollapsed,
      resetUi: state.resetUi,
    })),
  );

  const [captureFlashSquare, setCaptureFlashSquare] = useState<Square | null>(null);

  const boardSize = useMemo(() => {
    const maxWidth = 560;
    const minWidth = 270;
    return Math.max(minWidth, Math.min(width - 24, maxWidth));
  }, [width]);

  const optionPalette = useMemo(
    () => ({
      quietFill: uiTheme.moveOptionQuietFill,
      captureBorder: uiTheme.primaryDark,
      captureFill: uiTheme.moveOptionCaptureFill,
    }),
    [uiTheme.moveOptionCaptureFill, uiTheme.moveOptionQuietFill, uiTheme.primaryDark],
  );

  const historyRows = useMemo(() => toHistoryRows(moveHistory), [moveHistory]);

  const promotionOptions = useMemo(() => {
    if (!pendingPromotion) return [];
    return getPromotionOptions(pendingPromotion.color);
  }, [pendingPromotion]);

  const capturePulse = useSharedValue(0);

  const capturePulseStyle = useAnimatedStyle(() => ({
    opacity: capturePulse.value,
    transform: [{ scale: 0.92 + capturePulse.value * 0.14 }],
  }));

  useEffect(() => {
    startGame(timeControl);
    resetUi();
    setCaptureFlashSquare(null);
  }, [resetUi, startGame, timeControl]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickClock(Date.now());
    }, 150);

    return () => clearInterval(interval);
  }, [tickClock]);

  useEffect(() => {
    if (!lastMove || !lastMove.isCapture) return;

    setCaptureFlashSquare(lastMove.to);
    capturePulse.value = 0;

    capturePulse.value = withSequence(
      withTiming(0.95, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(
        0,
        {
          duration: 260,
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          if (!finished) return;
          scheduleOnRN(setCaptureFlashSquare, null);
        },
      ),
    );
  }, [capturePulse, lastMove]);

  const selectedSquareStyles = useMemo(() => {
    if (!selectedSquare) return {};

    return {
      [selectedSquare]: {
        borderWidth: 2,
        borderColor: uiTheme.primaryDark,
      },
    };
  }, [selectedSquare, uiTheme.primaryDark]);

  const lastMoveStyles = useMemo(() => {
    if (!lastMove) return {};

    return {
      [lastMove.from]: {
        backgroundColor: uiTheme.lastMoveFromBackground,
      },
      [lastMove.to]: {
        backgroundColor: uiTheme.lastMoveToBackground,
      },
    };
  }, [lastMove, uiTheme.lastMoveFromBackground, uiTheme.lastMoveToBackground]);

  const checkStyle = useMemo(() => {
    if (status !== 'check' && status !== 'checkmate') return {};

    const inDangerColor = turn === 'w' ? 'w' : 'b';
    const kingSquare = inDangerColor === 'w' ? whiteKingSquare : blackKingSquare;
    if (!kingSquare) return {};

    if (status === 'checkmate') {
      return {
        [kingSquare]: {
          backgroundColor: uiTheme.checkmateBackground,
          borderColor: uiTheme.dangerDark,
          borderWidth: 2,
        },
      };
    }

    return {
      [kingSquare]: {
        borderColor: uiTheme.checkBorder,
        borderWidth: 3,
      },
    };
  }, [
    blackKingSquare,
    status,
    turn,
    uiTheme.checkBorder,
    uiTheme.checkmateBackground,
    uiTheme.dangerDark,
    whiteKingSquare,
  ]);

  const customSquareStyles = useMemo(
    () => ({
      ...lastMoveStyles,
      ...selectedSquareStyles,
      ...optionSquares,
      ...checkStyle,
    }),
    [checkStyle, lastMoveStyles, optionSquares, selectedSquareStyles],
  );

  const boardStyle = useMemo(
    () => ({
      borderRadius: tokens.radius[4].val,
      borderWidth: 1,
      borderColor: uiTheme.buttonPrimaryBorder,
      overflow: 'hidden' as const,
      backgroundColor: uiTheme.light,
    }),
    [tokens.radius, uiTheme.buttonPrimaryBorder, uiTheme.light],
  );

  const showSquareOptions = (square: Square) => {
    const targets = getLegalTargets(square);
    if (targets.length === 0) {
      clearSelection();
      return false;
    }

    selectSquare(square);
    showMoveOptions(targets, optionPalette);
    return true;
  };

  const handleAttemptMove = (from: Square, to: Square) => {
    const moveResult = attemptMove(from, to);

    if (moveResult.ok || moveResult.requiresPromotion) {
      clearSelection();
    }

    return moveResult;
  };

  const handleBoardPieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    if (result || pendingPromotion) return false;
    if (piece[0] !== turn) return false;

    const moveResult = handleAttemptMove(sourceSquare, targetSquare);
    return moveResult.ok;
  };

  const handleBoardSquareClick = (square: Square, piece?: Piece) => {
    chessboardRef.current?.clearPremoves();

    if (result || pendingPromotion) {
      return false;
    }

    if (!selectedSquare) {
      if (!piece || piece[0] !== turn) {
        clearSelection();
        return false;
      }

      return showSquareOptions(square);
    }

    if (selectedSquare === square) {
      clearSelection();
      return true;
    }

    const moveResult = handleAttemptMove(selectedSquare, square);
    if (moveResult.ok || moveResult.requiresPromotion) {
      return moveResult.ok;
    }

    if (piece && piece[0] === turn) {
      return showSquareOptions(square);
    }

    clearSelection();
    return false;
  };

  const handleIsDraggablePiece = ({ piece }: { piece: Piece; sourceSquare: Square }) => {
    if (result || pendingPromotion) {
      return false;
    }

    return piece[0] === turn;
  };

  const handleConfirmPromotion = (pieceOption: Piece) => {
    const promoted = confirmPromotion(pieceOption);
    if (!promoted) return false;
    clearSelection();
    return true;
  };

  const statusMessage = useMemo(() => {
    if (result) {
      if (result.outcome === 'win' && result.winner) {
        return `Victoire ${colorToLabel(result.winner)} - ${resultReasonToLabel(result.reason)}`;
      }
      return `Partie nulle - ${resultReasonToLabel(result.reason)}`;
    }

    if (status === 'checkmate') return 'Echec et mat';
    if (status === 'check') return 'Echec';
    return `Trait aux ${colorToLabel(turn)}`;
  }, [result, status, turn]);

  const captureSquareBox = useMemo(() => {
    if (!captureFlashSquare) return null;
    return getSquareTopLeft(captureFlashSquare, boardOrientation, boardSize);
  }, [boardOrientation, boardSize, captureFlashSquare]);

  const isWhiteActive = clocks.activeColor === 'w' && !result;
  const isBlackActive = clocks.activeColor === 'b' && !result;

  const handleReplay = () => {
    chessboardRef.current?.clearPremoves();
    resetUi();
    setCaptureFlashSquare(null);
    resetGame();
  };

  return (
    <View style={localGameStyles.container}>
      <LocalGameStatusCard
        timeControlLabel={timeControl.label}
        statusMessage={statusMessage}
        whiteMs={clocks.whiteMs}
        blackMs={clocks.blackMs}
        isWhiteActive={isWhiteActive}
        isBlackActive={isBlackActive}
        onFlipBoard={flipBoard}
        onExit={onExit}
        theme={uiTheme}
      />

      <LocalGameBoardSection
        chessboardRef={chessboardRef}
        boardSize={boardSize}
        fen={fen}
        boardOrientation={boardOrientation}
        autoPromoteToQueen={config.autoPromoteToQueen}
        customBoardStyle={boardStyle}
        customSquareStyles={customSquareStyles}
        captureSquareBox={captureSquareBox}
        capturePulseStyle={capturePulseStyle}
        theme={uiTheme}
        onPieceDrop={handleBoardPieceDrop}
        onSquareClick={handleBoardSquareClick}
        isDraggablePiece={handleIsDraggablePiece}
      />

      <LocalGameHistoryPanel
        rows={historyRows}
        isCollapsed={isHistoryCollapsed}
        onToggleCollapse={toggleHistoryCollapsed}
        theme={uiTheme}
      />

      <LocalGamePromotionOverlay
        visible={Boolean(pendingPromotion)}
        promotionOptions={promotionOptions}
        onConfirmPiece={handleConfirmPromotion}
        onCancel={cancelPromotion}
        theme={uiTheme}
      />

      <LocalGameResultOverlay
        result={result}
        onReplay={handleReplay}
        onExit={onExit}
        theme={uiTheme}
      />
    </View>
  );
};
