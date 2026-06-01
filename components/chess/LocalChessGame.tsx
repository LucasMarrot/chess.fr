import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Share, useWindowDimensions } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text, View, YStack, getTokens } from 'tamagui';
import { useShallow } from 'zustand/react/shallow';

import type { LocalTimeControlPreset } from '@/constants/local-time-controls';
import { ChessButton } from '@/components/ui/ChessButton';
import { supabase } from '@/lib/supabase';

import type { ClearPremoves } from './ChessBoard';
import { LocalGameActionBar } from './local-game/LocalGameActionBar';
import { LocalGameBoardSection } from './local-game/LocalGameBoardSection';
import { LocalGameClock } from './local-game/LocalGameClock';
import { LocalGameDrawConfirmOverlay } from './local-game/LocalGameDrawConfirmOverlay';
import { LocalGameExitConfirmOverlay } from './local-game/LocalGameExitConfirmOverlay';
import { LocalGamePromotionOverlay } from './local-game/LocalGamePromotionOverlay';
import { LocalGameResultOverlay } from './local-game/LocalGameResultOverlay';
import { localGameStyles } from './local-game/styles';
import type { LocalGameTheme } from './local-game/types';
import { getSquareTopLeft, resolveClockLayout, withAlpha } from './local-game/utils';
import type { Piece, Square } from './chessboard-lib/types';
import {
  getPromotionOptions,
  type MoveAttemptResult,
  type RemoteGameSnapshot,
  useLocalChessGameStore,
} from './stores/use-local-chess-game-store';
import { useLocalChessUiStore } from './stores/use-local-chess-ui-store';

type LocalChessGameProps = {
  timeControl: LocalTimeControlPreset;
  initialOrientation?: 'white' | 'black';
  onExit: () => void;
  onReturnHome: () => void;
  onlineRoomId?: string;
  onlinePlayerColor?: 'white' | 'black';
  onlineInviteLink?: string;
};

type OnlineMovePayload = {
  id: string;
  roomId: string;
  fromClientId: string;
  from: Square;
  to: Square;
  color: 'w' | 'b';
  promotionPiece?: Piece;
  createdAt: number;
};

type OnlineSnapshotPayload = RemoteGameSnapshot & {
  roomId: string;
  fromClientId: string;
  createdAt: number;
};

type OnlineDrawPayload = {
  id: string;
  roomId: string;
  fromClientId: string;
  createdAt: number;
};

type OnlineRematchPayload = {
  id: string;
  roomId: string;
  fromClientId: string;
  createdAt: number;
};

type OnlineParticipant = {
  clientId: string;
  requestedColor: 'white' | 'black';
  joinedAt: number;
};

type OnlineRole = 'white' | 'black' | 'spectator';

function createOnlineEventId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createOnlineClientId() {
  return `client-${createOnlineEventId()}`;
}

function getOnlineParticipantsFromPresenceState(state: Record<string, unknown>) {
  return Object.values(state)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .map((value) => value as Partial<OnlineParticipant>)
    .filter(
      (value): value is OnlineParticipant =>
        typeof value.clientId === 'string' &&
        (value.requestedColor === 'white' || value.requestedColor === 'black') &&
        typeof value.joinedAt === 'number',
    )
    .sort((first, second) => first.joinedAt - second.joinedAt);
}

function resolveOnlineRole(clientId: string, participants: OnlineParticipant[]): OnlineRole {
  const whitePlayer = participants.find((participant) => participant.requestedColor === 'white');
  const blackPlayer = participants.find((participant) => participant.requestedColor === 'black');

  if (whitePlayer?.clientId === clientId) return 'white';
  if (blackPlayer?.clientId === clientId) return 'black';
  return 'spectator';
}

function getOppositeOnlineColor(color: 'white' | 'black') {
  return color === 'white' ? 'black' : 'white';
}

export const LocalChessGame = ({
  timeControl,
  initialOrientation,
  onExit,
  onReturnHome,
  onlineRoomId,
  onlinePlayerColor,
  onlineInviteLink,
}: LocalChessGameProps) => {
  const chessboardRef = useRef<ClearPremoves>(null);
  const lastExitConfirmRequestIdRef = useRef<number | null>(null);
  const onlineChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const seenOnlineMoveIdsRef = useRef(new Set<string>());
  const onlineClientIdRef = useRef(createOnlineClientId());
  const onlineSnapshotRef = useRef<RemoteGameSnapshot>({ fen: '', lastMove: null });
  const tokens = getTokens();
  const { width } = useWindowDimensions();

  const uiTheme = useMemo<LocalGameTheme>(
    () => ({
      light: String(tokens.color.light.val),
      dark: String(tokens.color.dark.val),
      primary: String(tokens.color.primary.val),
      interactionGrey: String(tokens.color.interactionGrey.val),
      buttonPrimaryHover: String(tokens.color.buttonPrimaryHover.val),
      buttonSecondaryBorder: String(tokens.color.buttonSecondaryBorder.val),
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
    setAutoFlip,
    lastMove,
    moveHistory,
    whiteKingSquare,
    blackKingSquare,
    clocks,
    startGame,
    resetGame,
    tickClock,
    declareDraw,
    flipBoard,
    attemptMove,
    applyRemoteMove,
    applyRemoteSnapshot,
    cancelPromotion,
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
      setAutoFlip: state.setAutoFlip,
      lastMove: state.lastMove,
      moveHistory: state.moveHistory,
      whiteKingSquare: state.whiteKingSquare,
      blackKingSquare: state.blackKingSquare,
      clocks: state.clocks,
      startGame: state.startGame,
      resetGame: state.resetGame,
      tickClock: state.tickClock,
      declareDraw: state.declareDraw,
      flipBoard: state.flipBoard,
      attemptMove: state.attemptMove,
      applyRemoteMove: state.applyRemoteMove,
      applyRemoteSnapshot: state.applyRemoteSnapshot,
      cancelPromotion: state.cancelPromotion,
      getLegalTargets: state.getLegalTargets,
    })),
  );

  const {
    selectedSquare,
    optionSquares,
    exitConfirmRequestId,
    selectSquare,
    showMoveOptions,
    clearSelection,
    resetUi,
  } = useLocalChessUiStore(
    useShallow((state) => ({
      selectedSquare: state.selectedSquare,
      optionSquares: state.optionSquares,
      exitConfirmRequestId: state.exitConfirmRequestId,
      selectSquare: state.selectSquare,
      showMoveOptions: state.showMoveOptions,
      clearSelection: state.clearSelection,
      resetUi: state.resetUi,
    })),
  );

  const [captureFlashSquare, setCaptureFlashSquare] = useState<Square | null>(null);
  const [isDrawConfirmOpen, setIsDrawConfirmOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const [onlineParticipants, setOnlineParticipants] = useState<OnlineParticipant[]>([]);
  const [incomingDrawOfferId, setIncomingDrawOfferId] = useState<string | null>(null);
  const [isDrawOfferPending, setIsDrawOfferPending] = useState(false);
  const [drawStatusMessage, setDrawStatusMessage] = useState<string | null>(null);
  const [incomingRematchOfferId, setIncomingRematchOfferId] = useState<string | null>(null);
  const [isRematchOfferPending, setIsRematchOfferPending] = useState(false);
  const [activeOnlineColor, setActiveOnlineColor] = useState<'white' | 'black' | null>(null);

  const isOnlineGame = Boolean(onlineRoomId && onlinePlayerColor);
  const onlineRole = isOnlineGame
    ? resolveOnlineRole(onlineClientIdRef.current, onlineParticipants)
    : null;
  const isOnlinePlayer = onlineRole === 'white' || onlineRole === 'black';
  const playerOnlineColor: 'white' | 'black' =
    activeOnlineColor ??
    (onlineRole === 'white' || onlineRole === 'black'
      ? onlineRole
      : (onlinePlayerColor ?? 'white'));
  const onlineTurnColor = playerOnlineColor === 'black' ? 'b' : 'w';
  const hasWhiteOnlinePlayer = onlineParticipants.some(
    (participant) => resolveOnlineRole(participant.clientId, onlineParticipants) === 'white',
  );
  const hasBlackOnlinePlayer = onlineParticipants.some(
    (participant) => resolveOnlineRole(participant.clientId, onlineParticipants) === 'black',
  );
  const hasTwoOnlinePlayers = hasWhiteOnlinePlayer && hasBlackOnlinePlayer;
  const isConfirmedSpectator = isOnlineGame && hasTwoOnlinePlayers && !isOnlinePlayer;
  const waitingCardWidth = Math.max(280, Math.min(width - 32, 390));

  const boardSize = useMemo(() => {
    const maxWidth = 560;
    const minWidth = 270;
    return Math.max(minWidth - 20, Math.min(width - 24, maxWidth) - 20);
  }, [width]);

  const optionPalette = useMemo(
    () => ({
      quietFill: uiTheme.moveOptionQuietFill,
      captureBorder: uiTheme.primaryDark,
      captureFill: uiTheme.moveOptionCaptureFill,
    }),
    [uiTheme.moveOptionCaptureFill, uiTheme.moveOptionQuietFill, uiTheme.primaryDark],
  );

  const promotionOptions = useMemo(() => {
    if (!pendingPromotion) return [];
    return getPromotionOptions(pendingPromotion.color);
  }, [pendingPromotion]);

  const capturePulse = useSharedValue(0);

  const capturePulseStyle = useAnimatedStyle(() => ({
    opacity: capturePulse.value,
    transform: [{ scale: 0.92 + capturePulse.value * 0.14 }],
  }));

  const resetOnlineGameWithColor = useCallback(
    (nextColor: 'white' | 'black') => {
      setActiveOnlineColor(nextColor);
      chessboardRef.current?.clearPremoves();
      resetUi();
      setCaptureFlashSquare(null);
      setIsDrawConfirmOpen(false);
      setIsExitConfirmOpen(false);
      setIncomingDrawOfferId(null);
      setIsDrawOfferPending(false);
      setDrawStatusMessage(null);
      setIncomingRematchOfferId(null);
      setIsRematchOfferPending(false);
      startGame(timeControl, nextColor);
    },
    [resetUi, startGame, timeControl],
  );

  useEffect(() => {
    startGame(timeControl, initialOrientation);
    resetUi();
    setCaptureFlashSquare(null);
  }, [initialOrientation, resetUi, startGame, timeControl]);

  useEffect(() => {
    if (!isOnlinePlayer || activeOnlineColor) return;
    setActiveOnlineColor(onlineRole);
  }, [activeOnlineColor, isOnlinePlayer, onlineRole]);

  useEffect(() => {
    onlineSnapshotRef.current = {
      fen,
      lastMove,
    };
  }, [fen, lastMove, moveHistory.length]);

  useEffect(() => {
    if (!onlineRoomId || !onlinePlayerColor) {
      setOnlineParticipants([]);
      setActiveOnlineColor(null);
      return;
    }

    seenOnlineMoveIdsRef.current.clear();

    const clientId = onlineClientIdRef.current;
    const channel = supabase
      .channel(`online-chess:${onlineRoomId}`)
      .on('presence', { event: 'sync' }, () => {
        const participants = getOnlineParticipantsFromPresenceState(channel.presenceState());
        setOnlineParticipants(participants);

        const role = resolveOnlineRole(clientId, participants);
        if (role === 'white' || role === 'black') {
          void channel.send({
            type: 'broadcast',
            event: 'snapshot',
            payload: {
              ...onlineSnapshotRef.current,
              roomId: onlineRoomId,
              fromClientId: clientId,
              createdAt: Date.now(),
            } satisfies OnlineSnapshotPayload,
          });
        }
      })
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        const movePayload = payload as Partial<OnlineMovePayload>;

        if (
          !movePayload.id ||
          movePayload.roomId !== onlineRoomId ||
          movePayload.fromClientId === clientId ||
          !movePayload.from ||
          !movePayload.to ||
          seenOnlineMoveIdsRef.current.has(movePayload.id)
        ) {
          return;
        }

        seenOnlineMoveIdsRef.current.add(movePayload.id);
        chessboardRef.current?.clearPremoves();
        clearSelection();
        applyRemoteMove(movePayload.from, movePayload.to, movePayload.promotionPiece);
      })
      .on('broadcast', { event: 'snapshot' }, ({ payload }) => {
        const snapshotPayload = payload as Partial<OnlineSnapshotPayload>;

        if (
          snapshotPayload.roomId !== onlineRoomId ||
          snapshotPayload.fromClientId === clientId ||
          !snapshotPayload.fen
        ) {
          return;
        }

        applyRemoteSnapshot({
          fen: snapshotPayload.fen,
          lastMove: snapshotPayload.lastMove ?? null,
        });
      })
      .on('broadcast', { event: 'draw-offer' }, ({ payload }) => {
        const drawPayload = payload as Partial<OnlineDrawPayload>;

        if (
          drawPayload.roomId !== onlineRoomId ||
          drawPayload.fromClientId === clientId ||
          !drawPayload.id
        ) {
          return;
        }

        setIncomingDrawOfferId(drawPayload.id);
        setDrawStatusMessage(null);
        setIsDrawConfirmOpen(true);
      })
      .on('broadcast', { event: 'draw-accepted' }, ({ payload }) => {
        const drawPayload = payload as Partial<OnlineDrawPayload>;

        if (drawPayload.roomId !== onlineRoomId || !drawPayload.id) {
          return;
        }

        setIncomingDrawOfferId(null);
        setIsDrawOfferPending(false);
        setDrawStatusMessage(null);
        setIsDrawConfirmOpen(false);
        clearSelection();
        declareDraw();
      })
      .on('broadcast', { event: 'draw-declined' }, ({ payload }) => {
        const drawPayload = payload as Partial<OnlineDrawPayload>;

        if (drawPayload.roomId !== onlineRoomId || !drawPayload.id) {
          return;
        }

        setIncomingDrawOfferId(null);
        setIsDrawOfferPending(false);
        setDrawStatusMessage('Votre proposition de nulle a ete refusee.');
        setIsDrawConfirmOpen(false);
      })
      .on('broadcast', { event: 'rematch-offer' }, ({ payload }) => {
        const rematchPayload = payload as Partial<OnlineRematchPayload>;

        if (
          rematchPayload.roomId !== onlineRoomId ||
          rematchPayload.fromClientId === clientId ||
          !rematchPayload.id
        ) {
          return;
        }

        setIncomingRematchOfferId(rematchPayload.id);
      })
      .on('broadcast', { event: 'rematch-accepted' }, ({ payload }) => {
        const rematchPayload = payload as Partial<OnlineRematchPayload>;

        if (rematchPayload.roomId !== onlineRoomId || !rematchPayload.id) {
          return;
        }

        setIncomingRematchOfferId(null);
        setIsRematchOfferPending(false);
        resetOnlineGameWithColor(getOppositeOnlineColor(playerOnlineColor));
      })
      .on('broadcast', { event: 'rematch-declined' }, ({ payload }) => {
        const rematchPayload = payload as Partial<OnlineRematchPayload>;

        if (rematchPayload.roomId !== onlineRoomId || !rematchPayload.id) {
          return;
        }

        setIncomingRematchOfferId(null);
        setIsRematchOfferPending(false);
        chessboardRef.current?.clearPremoves();
        resetUi();
        setCaptureFlashSquare(null);
        resetGame();
        onReturnHome();
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;

        void channel.track({
          clientId,
          requestedColor: onlinePlayerColor,
          joinedAt: Date.now(),
        } satisfies OnlineParticipant);
      });

    onlineChannelRef.current = channel;

    return () => {
      onlineChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [
    applyRemoteMove,
    applyRemoteSnapshot,
    clearSelection,
    declareDraw,
    onlinePlayerColor,
    onlineRoomId,
    onReturnHome,
    playerOnlineColor,
    resetGame,
    resetOnlineGameWithColor,
    resetUi,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickClock(Date.now());
    }, 150);

    return () => clearInterval(interval);
  }, [tickClock]);

  useEffect(() => {
    if (lastExitConfirmRequestIdRef.current === null) {
      lastExitConfirmRequestIdRef.current = exitConfirmRequestId;
      return;
    }

    if (exitConfirmRequestId <= lastExitConfirmRequestIdRef.current) {
      return;
    }

    lastExitConfirmRequestIdRef.current = exitConfirmRequestId;
    setIsExitConfirmOpen(true);
  }, [exitConfirmRequestId]);

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

  const publishOnlineMove = (moveResult: MoveAttemptResult, promotionPiece?: Piece) => {
    if (!isOnlineGame || !onlineRoomId || !moveResult.move) return;

    const id = createOnlineEventId();
    seenOnlineMoveIdsRef.current.add(id);

    void onlineChannelRef.current?.send({
      type: 'broadcast',
      event: 'move',
      payload: {
        id,
        roomId: onlineRoomId,
        fromClientId: onlineClientIdRef.current,
        from: moveResult.move.from,
        to: moveResult.move.to,
        color: moveResult.move.color,
        ...(promotionPiece ? { promotionPiece } : {}),
        createdAt: Date.now(),
      } satisfies OnlineMovePayload,
    });

    void onlineChannelRef.current?.send({
      type: 'broadcast',
      event: 'snapshot',
      payload: {
        fen: useLocalChessGameStore.getState().fen,
        lastMove: moveResult.move,
        roomId: onlineRoomId,
        fromClientId: onlineClientIdRef.current,
        createdAt: Date.now(),
      } satisfies OnlineSnapshotPayload,
    });
  };

  const handleAttemptMove = (from: Square, to: Square, promotionPiece?: Piece) => {
    const moveResult = attemptMove(from, to, promotionPiece);

    if (moveResult.ok || moveResult.requiresPromotion) {
      clearSelection();
    }

    if (moveResult.ok) {
      publishOnlineMove(moveResult, promotionPiece);
    }

    return moveResult;
  };

  const handleBoardPieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    if (result || pendingPromotion) return false;
    if (isOnlineGame && (!isOnlinePlayer || !hasTwoOnlinePlayers)) return false;
    if (isOnlineGame && piece[0] !== onlineTurnColor) return false;
    if (piece[0] !== turn) return false;

    const moveResult = handleAttemptMove(sourceSquare, targetSquare);
    return moveResult.ok;
  };

  const handleBoardSquareClick = (square: Square, piece?: Piece) => {
    chessboardRef.current?.clearPremoves();

    if (result || pendingPromotion) {
      return false;
    }

    if (isOnlineGame && (!isOnlinePlayer || !hasTwoOnlinePlayers)) {
      clearSelection();
      return false;
    }

    if (!selectedSquare) {
      if (!piece || piece[0] !== turn || (isOnlineGame && piece[0] !== onlineTurnColor)) {
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

    if (piece && piece[0] === turn && (!isOnlineGame || piece[0] === onlineTurnColor)) {
      return showSquareOptions(square);
    }

    clearSelection();
    return false;
  };

  const handleIsDraggablePiece = ({ piece }: { piece: Piece; sourceSquare: Square }) => {
    if (result || pendingPromotion) {
      return false;
    }

    if (isOnlineGame && (!isOnlinePlayer || !hasTwoOnlinePlayers)) {
      return false;
    }

    if (isOnlineGame && piece[0] !== onlineTurnColor) {
      return false;
    }

    return piece[0] === turn;
  };

  const handleConfirmPromotion = (pieceOption: Piece) => {
    if (!pendingPromotion) return false;

    const promoted = handleAttemptMove(pendingPromotion.from, pendingPromotion.to, pieceOption);
    if (!promoted.ok) return false;
    clearSelection();
    return true;
  };

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

  const resetBeforeExit = () => {
    chessboardRef.current?.clearPremoves();
    resetUi();
    setCaptureFlashSquare(null);
    setIsDrawConfirmOpen(false);
    setIsExitConfirmOpen(false);
    setIncomingDrawOfferId(null);
    setIsDrawOfferPending(false);
    setDrawStatusMessage(null);
    setIncomingRematchOfferId(null);
    setIsRematchOfferPending(false);
    resetGame();
  };

  const handleExitPress = () => {
    setIsExitConfirmOpen(true);
  };

  const handleCancelExit = () => {
    setIsExitConfirmOpen(false);
  };

  const handleConfirmExit = () => {
    resetBeforeExit();
    onExit();
  };

  const handleReturnHomePress = () => {
    resetBeforeExit();
    onReturnHome();
  };

  const handleFlipPress = () => {
    flipBoard();
  };

  const handleAutoFlipPress = () => {
    setAutoFlip(!config.autoFlip);
  };

  const handleDrawPress = () => {
    if (isConfirmedSpectator) return;
    if (isOnlineGame && isDrawOfferPending) return;
    if (result) return;
    setIsDrawConfirmOpen(true);
  };

  const handleCancelDraw = () => {
    if (isOnlineGame && incomingDrawOfferId && onlineRoomId) {
      void onlineChannelRef.current?.send({
        type: 'broadcast',
        event: 'draw-declined',
        payload: {
          id: incomingDrawOfferId,
          roomId: onlineRoomId,
          fromClientId: onlineClientIdRef.current,
          createdAt: Date.now(),
        } satisfies OnlineDrawPayload,
      });
    }

    setIncomingDrawOfferId(null);
    setIsDrawConfirmOpen(false);
  };

  const handleConfirmDraw = () => {
    setIsDrawConfirmOpen(false);
    clearSelection();

    if (isOnlineGame && onlineRoomId) {
      if (incomingDrawOfferId) {
        void onlineChannelRef.current?.send({
          type: 'broadcast',
          event: 'draw-accepted',
          payload: {
            id: incomingDrawOfferId,
            roomId: onlineRoomId,
            fromClientId: onlineClientIdRef.current,
            createdAt: Date.now(),
          } satisfies OnlineDrawPayload,
        });

        setIncomingDrawOfferId(null);
        setIsDrawOfferPending(false);
        setDrawStatusMessage(null);
        declareDraw();
        return;
      }

      const offerId = createOnlineEventId();
      setIsDrawOfferPending(true);
      setDrawStatusMessage('Proposition de nulle envoyee.');
      void onlineChannelRef.current?.send({
        type: 'broadcast',
        event: 'draw-offer',
        payload: {
          id: offerId,
          roomId: onlineRoomId,
          fromClientId: onlineClientIdRef.current,
          createdAt: Date.now(),
        } satisfies OnlineDrawPayload,
      });
      return;
    }

    declareDraw();
  };

  const handleCopyInviteLink = async () => {
    if (!onlineInviteLink) return;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(onlineInviteLink);
      } else {
        await Share.share({
          message: onlineInviteLink,
          url: onlineInviteLink,
        });
      }

      setIsInviteCopied(true);
      setTimeout(() => setIsInviteCopied(false), 1800);
    } catch {
      setIsInviteCopied(false);
    }
  };

  const handleRematchPress = () => {
    if (!isOnlineGame) {
      handleReplay();
      return;
    }

    if (!onlineRoomId || isConfirmedSpectator || isRematchOfferPending) return;

    const offerId = createOnlineEventId();
    setIsRematchOfferPending(true);
    void onlineChannelRef.current?.send({
      type: 'broadcast',
      event: 'rematch-offer',
      payload: {
        id: offerId,
        roomId: onlineRoomId,
        fromClientId: onlineClientIdRef.current,
        createdAt: Date.now(),
      } satisfies OnlineRematchPayload,
    });
  };

  const handleAcceptRematch = () => {
    if (!onlineRoomId || !incomingRematchOfferId) return;

    void onlineChannelRef.current?.send({
      type: 'broadcast',
      event: 'rematch-accepted',
      payload: {
        id: incomingRematchOfferId,
        roomId: onlineRoomId,
        fromClientId: onlineClientIdRef.current,
        createdAt: Date.now(),
      } satisfies OnlineRematchPayload,
    });

    setIncomingRematchOfferId(null);
    setIsRematchOfferPending(false);
    resetOnlineGameWithColor(getOppositeOnlineColor(playerOnlineColor));
  };

  const handleDeclineRematch = () => {
    if (onlineRoomId && incomingRematchOfferId) {
      void onlineChannelRef.current?.send({
        type: 'broadcast',
        event: 'rematch-declined',
        payload: {
          id: incomingRematchOfferId,
          roomId: onlineRoomId,
          fromClientId: onlineClientIdRef.current,
          createdAt: Date.now(),
        } satisfies OnlineRematchPayload,
      });
    }

    setIncomingRematchOfferId(null);
    setIsRematchOfferPending(false);
    handleReturnHomePress();
  };

  const { topClock, bottomClock } = useMemo(
    () =>
      resolveClockLayout({
        boardOrientation,
        autoFlip: config.autoFlip,
        whiteMs: clocks.whiteMs,
        blackMs: clocks.blackMs,
        isWhiteActive,
        isBlackActive,
      }),
    [
      boardOrientation,
      clocks.blackMs,
      clocks.whiteMs,
      config.autoFlip,
      isBlackActive,
      isWhiteActive,
    ],
  );
  const baseClockMs = timeControl.baseMinutes * 60 * 1000;
  const isCompactScreen = width <= 390;
  const topClockOffset = isCompactScreen ? -54 : -64;
  const bottomClockOffset = isCompactScreen ? -54 : -64;
  const boardClusterMarginTop = isCompactScreen ? 30 : 38;
  const boardClusterMarginBottom = isCompactScreen ? 52 : 64;
  const shouldShowOnlineWaiting = isOnlineGame && !hasTwoOnlinePlayers;

  if (shouldShowOnlineWaiting) {
    return (
      <View style={localGameStyles.container}>
        <YStack
          alignSelf="center"
          width={waitingCardWidth}
          backgroundColor={uiTheme.light}
          borderColor={uiTheme.buttonPrimaryBorder}
          borderWidth={1}
          borderRadius={14}
          padding={isCompactScreen ? '$3' : '$4'}
          gap={isCompactScreen ? '$3' : '$4'}
        >
          <YStack gap="$2">
            <Text color={uiTheme.dark} fontSize={isCompactScreen ? '$6' : '$7'} fontWeight="800">
              En attente adversaire
            </Text>
            <Text color={uiTheme.interactionGrey} fontSize={isCompactScreen ? '$3' : '$4'}>
              La partie commencera quand les deux joueurs auront rejoint la salle.
            </Text>
          </YStack>

          {onlineInviteLink ? (
            <YStack
              backgroundColor={uiTheme.historyHeaderBackground}
              borderColor={uiTheme.buttonSecondaryBorder}
              borderWidth={1}
              borderRadius={10}
              padding={isCompactScreen ? '$2' : '$3'}
              gap="$2"
            >
              <Text color={uiTheme.dark} fontSize="$3" fontWeight="700">
                Lien invitation
              </Text>
              <Text color={uiTheme.interactionGrey} fontSize="$3" numberOfLines={3}>
                {onlineInviteLink}
              </Text>
            </YStack>
          ) : null}

          <YStack gap="$3">
            <ChessButton
              variant="primary"
              size={isCompactScreen ? 'md' : 'lg'}
              fullWidth
              onPress={handleCopyInviteLink}
            >
              {isInviteCopied ? 'Lien copié' : 'Copier le lien'}
            </ChessButton>
            <ChessButton
              variant="secondary"
              size={isCompactScreen ? 'md' : 'lg'}
              fullWidth
              onPress={handleConfirmExit}
            >
              Quitter
            </ChessButton>
          </YStack>
        </YStack>

        <LocalGameExitConfirmOverlay
          visible={isExitConfirmOpen}
          onCancel={handleCancelExit}
          onConfirm={handleConfirmExit}
          theme={uiTheme}
        />
      </View>
    );
  }

  return (
    <View style={localGameStyles.container}>
      <View
        style={[
          localGameStyles.boardCluster,
          {
            width: boardSize,
            height: boardSize,
            marginTop: boardClusterMarginTop,
            marginBottom: boardClusterMarginBottom,
          },
        ]}
      >
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

        <View
          style={[localGameStyles.topClockAnchor, { top: topClockOffset }]}
          pointerEvents="none"
        >
          <LocalGameClock clock={topClock} totalMs={baseClockMs} />
        </View>

        <View
          style={[localGameStyles.bottomClockAnchor, { bottom: bottomClockOffset }]}
          pointerEvents="none"
        >
          <LocalGameClock clock={bottomClock} totalMs={baseClockMs} />
        </View>
      </View>

      <LocalGameActionBar
        isAutoFlipEnabled={config.autoFlip}
        onExitPress={handleExitPress}
        onDrawPress={handleDrawPress}
        onFlipPress={handleFlipPress}
        onAutoFlipPress={handleAutoFlipPress}
        isSpectator={isConfirmedSpectator}
      />

      {drawStatusMessage ? (
        <Text color={uiTheme.interactionGrey} fontSize="$3" fontWeight="700" textAlign="center">
          {drawStatusMessage}
        </Text>
      ) : null}

      <LocalGamePromotionOverlay
        visible={Boolean(pendingPromotion)}
        promotionOptions={promotionOptions}
        onConfirmPiece={handleConfirmPromotion}
        onCancel={cancelPromotion}
        theme={uiTheme}
      />

      <LocalGameDrawConfirmOverlay
        visible={isDrawConfirmOpen}
        onCancel={handleCancelDraw}
        onConfirm={handleConfirmDraw}
        theme={uiTheme}
        title={incomingDrawOfferId ? 'Proposition de nulle' : 'Confirmer la nulle ?'}
        description={
          incomingDrawOfferId
            ? 'Votre adversaire propose une partie nulle.'
            : isOnlineGame
              ? 'Envoyer une proposition de nulle a votre adversaire ?'
              : 'Voulez-vous vraiment declarer la partie nulle ?'
        }
        confirmLabel={incomingDrawOfferId ? 'Accepter' : 'Confirmer'}
        cancelLabel={incomingDrawOfferId ? 'Refuser' : 'Annuler'}
      />

      <LocalGameExitConfirmOverlay
        visible={isExitConfirmOpen}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
        theme={uiTheme}
      />

      <LocalGameResultOverlay
        result={result}
        onReplay={handleRematchPress}
        onExit={handleReturnHomePress}
        theme={uiTheme}
        canReplay={!isOnlineGame || !isConfirmedSpectator}
        replayLabel={
          isOnlineGame ? (isRematchOfferPending ? 'Revanche envoyee' : 'Revanche') : 'Rejouer'
        }
      />

      <LocalGameDrawConfirmOverlay
        visible={Boolean(incomingRematchOfferId)}
        onCancel={handleDeclineRematch}
        onConfirm={handleAcceptRematch}
        theme={uiTheme}
        title="Proposition de revanche"
        description="Votre adversaire propose une revanche."
        confirmLabel="Accepter"
        cancelLabel="Refuser"
      />
    </View>
  );
};
