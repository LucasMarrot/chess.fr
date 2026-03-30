import { Chess, type Color, type PieceSymbol, type Square as ChessJsSquare } from 'chess.js';
import { create } from 'zustand';

import type { LocalTimeControlPreset } from '@/constants/local-time-controls';
import { getLocalTimeControlByKey } from '@/constants/local-time-controls';

import type { BoardOrientation, Piece, Square } from '../chessboard-lib/types';

const START_FEN = 'start';

type PromotionSymbol = Extract<PieceSymbol, 'q' | 'r' | 'b' | 'n'>;

export type LocalGameStatus =
  | 'ongoing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'insufficient-material'
  | 'threefold-repetition'
  | 'fifty-move-rule'
  | 'timeout';

export type LocalGameResultReason =
  | 'checkmate'
  | 'stalemate'
  | 'threefold-repetition'
  | 'insufficient-material'
  | 'fifty-move-rule'
  | 'draw'
  | 'timeout'
  | 'timeout-insufficient-material';

export type LocalGameResult = {
  outcome: 'win' | 'draw';
  reason: LocalGameResultReason;
  winner?: Color;
  loser?: Color;
};

export type PendingPromotion = {
  from: Square;
  to: Square;
  color: Color;
};

type MoveAttemptResult = {
  ok: boolean;
  requiresPromotion: boolean;
};

type LocalGameConfig = {
  autoFlip: boolean;
  autoPromoteToQueen: boolean;
};

type LocalMoveTarget = {
  to: Square;
  isCapture: boolean;
};

export type LocalMoveRecord = {
  from: Square;
  to: Square;
  san: string;
  color: Color;
  isCapture: boolean;
};

type LocalClockState = {
  whiteMs: number;
  blackMs: number;
  incrementMs: number;
  started: boolean;
  activeColor: Color | null;
  lastTickAt: number | null;
};

type LocalChessGameState = {
  chess: Chess;
  fen: string;
  turn: Color;
  boardOrientation: BoardOrientation;
  status: LocalGameStatus;
  result: LocalGameResult | null;
  whiteKingInCheck: boolean;
  blackKingInCheck: boolean;
  whiteKingSquare: Square | null;
  blackKingSquare: Square | null;
  pendingPromotion: PendingPromotion | null;
  moveHistory: string[];
  lastMove: LocalMoveRecord | null;
  timeControl: LocalTimeControlPreset;
  clocks: LocalClockState;
  config: LocalGameConfig;
  startGame: (timeControl: LocalTimeControlPreset) => void;
  resetGame: () => void;
  tickClock: (now?: number) => void;
  flipBoard: () => void;
  setAutoFlip: (enabled: boolean) => void;
  setAutoPromoteToQueen: (enabled: boolean) => void;
  getLegalTargets: (square: Square) => LocalMoveTarget[];
  attemptMove: (from: Square, to: Square, promotionPiece?: Piece) => MoveAttemptResult;
  confirmPromotion: (piece: Piece) => boolean;
  cancelPromotion: () => void;
};

function turnToOrientation(turn: Color): BoardOrientation {
  return turn === 'w' ? 'white' : 'black';
}

function toBoardPiece(color: Color, piece: PieceSymbol): Piece {
  return `${color}${piece.toUpperCase()}` as Piece;
}

function toPromotionSymbol(piece?: Piece): PromotionSymbol | undefined {
  if (!piece) return undefined;
  const symbol = piece[1]?.toLowerCase();
  if (symbol === 'q' || symbol === 'r' || symbol === 'b' || symbol === 'n') {
    return symbol;
  }
  return undefined;
}

function getBoardPieces(
  chess: Chess,
  color?: Color,
): Array<{ type: PieceSymbol; color: Color; square: Square }> {
  const board = chess.board();
  const pieces: Array<{ type: PieceSymbol; color: Color; square: Square }> = [];

  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const rank = 8 - rankIndex;
    const row = board[rankIndex] ?? [];

    for (let fileIndex = 0; fileIndex < row.length; fileIndex += 1) {
      const file = String.fromCharCode(97 + fileIndex);
      const square = `${file}${rank}` as Square;
      const piece = row[fileIndex];
      if (!piece) continue;
      if (color && piece.color !== color) continue;

      pieces.push({
        type: piece.type,
        color: piece.color,
        square,
      });
    }
  }

  return pieces;
}

function findKingSquare(chess: Chess, color: Color): Square | null {
  const king = getBoardPieces(chess, color).find((piece) => piece.type === 'k');
  return king?.square ?? null;
}

function isSameColorSquare(a: Square, b: Square): boolean {
  const fileA = a.charCodeAt(0) - 96;
  const rankA = Number(a[1]);
  const fileB = b.charCodeAt(0) - 96;
  const rankB = Number(b[1]);
  return (fileA + rankA) % 2 === (fileB + rankB) % 2;
}

function hasMatingMaterial(chess: Chess, color: Color): boolean {
  const pieces = getBoardPieces(chess, color);
  const nonKings = pieces.filter((piece) => piece.type !== 'k');

  if (nonKings.length === 0) return false;
  if (nonKings.length === 1 && (nonKings[0].type === 'b' || nonKings[0].type === 'n')) return false;

  if (nonKings.length === 2 && nonKings.every((piece) => piece.type === 'n')) {
    return false;
  }

  if (nonKings.length === 2 && nonKings.every((piece) => piece.type === 'b')) {
    return !isSameColorSquare(nonKings[0].square, nonKings[1].square);
  }

  return true;
}

function deriveStatusAndResult(chess: Chess): {
  status: LocalGameStatus;
  result: LocalGameResult | null;
} {
  if (chess.isCheckmate()) {
    const loser = chess.turn();
    const winner = loser === 'w' ? 'b' : 'w';
    return {
      status: 'checkmate',
      result: {
        outcome: 'win',
        reason: 'checkmate',
        winner,
        loser,
      },
    };
  }

  if (chess.isStalemate()) {
    return {
      status: 'stalemate',
      result: {
        outcome: 'draw',
        reason: 'stalemate',
      },
    };
  }

  if (chess.isInsufficientMaterial()) {
    return {
      status: 'insufficient-material',
      result: {
        outcome: 'draw',
        reason: 'insufficient-material',
      },
    };
  }

  if (chess.isThreefoldRepetition()) {
    return {
      status: 'threefold-repetition',
      result: {
        outcome: 'draw',
        reason: 'threefold-repetition',
      },
    };
  }

  if ('isDrawByFiftyMoves' in chess && typeof chess.isDrawByFiftyMoves === 'function') {
    if (chess.isDrawByFiftyMoves()) {
      return {
        status: 'fifty-move-rule',
        result: {
          outcome: 'draw',
          reason: 'fifty-move-rule',
        },
      };
    }
  }

  if (chess.isDraw()) {
    return {
      status: 'draw',
      result: {
        outcome: 'draw',
        reason: 'draw',
      },
    };
  }

  if (chess.inCheck()) {
    return {
      status: 'check',
      result: null,
    };
  }

  return {
    status: 'ongoing',
    result: null,
  };
}

function deriveCheckState(chess: Chess) {
  return {
    whiteKingInCheck: chess.turn() === 'w' && chess.inCheck(),
    blackKingInCheck: chess.turn() === 'b' && chess.inCheck(),
  };
}

function deriveKingSquares(chess: Chess) {
  return {
    whiteKingSquare: findKingSquare(chess, 'w'),
    blackKingSquare: findKingSquare(chess, 'b'),
  };
}

function resolveTimeoutResult(chess: Chess, flaggedColor: Color): LocalGameResult {
  const winner = flaggedColor === 'w' ? 'b' : 'w';

  if (!hasMatingMaterial(chess, winner)) {
    return {
      outcome: 'draw',
      reason: 'timeout-insufficient-material',
    };
  }

  return {
    outcome: 'win',
    reason: 'timeout',
    winner,
    loser: flaggedColor,
  };
}

function isPromotionMove(chess: Chess, from: Square, to: Square): boolean {
  const moves = chess.moves({ square: from as ChessJsSquare, verbose: true });
  return moves.some((move) => move.to === to && Boolean(move.promotion));
}

function getLocalMoveTargets(chess: Chess, square: Square): LocalMoveTarget[] {
  const moves = chess.moves({ square: square as ChessJsSquare, verbose: true });
  return moves.map((move) => ({
    to: move.to as Square,
    isCapture: move.flags.includes('c') || move.flags.includes('e'),
  }));
}

function createClockState(timeControl: LocalTimeControlPreset): LocalClockState {
  const initialMs = timeControl.baseMinutes * 60 * 1000;

  return {
    whiteMs: initialMs,
    blackMs: initialMs,
    incrementMs: timeControl.incrementSeconds * 1000,
    started: false,
    activeColor: null,
    lastTickAt: null,
  };
}

function createInitialChessState(timeControl: LocalTimeControlPreset) {
  const chess = new Chess();
  const status = deriveStatusAndResult(chess);

  return {
    chess,
    fen: chess.fen(),
    turn: chess.turn(),
    boardOrientation: 'white' as BoardOrientation,
    status: status.status,
    result: status.result,
    pendingPromotion: null as PendingPromotion | null,
    moveHistory: [] as string[],
    lastMove: null as LocalMoveRecord | null,
    timeControl,
    clocks: createClockState(timeControl),
    ...deriveCheckState(chess),
    ...deriveKingSquares(chess),
  };
}

function getClocksAfterElapsed(clocks: LocalClockState, now: number) {
  if (!clocks.started || !clocks.activeColor || clocks.lastTickAt === null) {
    return {
      clocks,
      timedOutColor: null as Color | null,
    };
  }

  const elapsed = Math.max(0, now - clocks.lastTickAt);

  if (elapsed === 0) {
    return {
      clocks,
      timedOutColor: null as Color | null,
    };
  }

  if (clocks.activeColor === 'w') {
    const nextWhite = clocks.whiteMs - elapsed;
    if (nextWhite <= 0) {
      return {
        clocks: {
          ...clocks,
          whiteMs: 0,
          lastTickAt: now,
        },
        timedOutColor: 'w' as Color,
      };
    }

    return {
      clocks: {
        ...clocks,
        whiteMs: nextWhite,
        lastTickAt: now,
      },
      timedOutColor: null as Color | null,
    };
  }

  const nextBlack = clocks.blackMs - elapsed;
  if (nextBlack <= 0) {
    return {
      clocks: {
        ...clocks,
        blackMs: 0,
        lastTickAt: now,
      },
      timedOutColor: 'b' as Color,
    };
  }

  return {
    clocks: {
      ...clocks,
      blackMs: nextBlack,
      lastTickAt: now,
    },
    timedOutColor: null as Color | null,
  };
}

function applyTimeoutState(
  chess: Chess,
  clocks: LocalClockState,
  timedOutColor: Color,
): {
  status: LocalGameStatus;
  result: LocalGameResult;
  clocks: LocalClockState;
} {
  const result = resolveTimeoutResult(chess, timedOutColor);

  return {
    status: 'timeout',
    result,
    clocks: {
      ...clocks,
      started: true,
      activeColor: null,
      lastTickAt: null,
    },
  };
}

const DEFAULT_TIME_CONTROL = getLocalTimeControlByKey('3_5');

export const useLocalChessGameStore = create<LocalChessGameState>((set, get) => ({
  ...createInitialChessState(DEFAULT_TIME_CONTROL),
  config: {
    autoFlip: false,
    autoPromoteToQueen: false,
  },

  startGame: (timeControl) => {
    const fresh = createInitialChessState(timeControl);
    set({
      ...fresh,
      boardOrientation: 'white',
      config: {
        ...get().config,
        autoFlip: false,
      },
    });
  },

  resetGame: () => {
    const fresh = createInitialChessState(get().timeControl);
    set({
      ...fresh,
      boardOrientation: 'white',
      config: {
        ...get().config,
        autoFlip: false,
      },
    });
  },

  tickClock: (now = Date.now()) => {
    const state = get();
    if (state.result) return;

    const elapsedState = getClocksAfterElapsed(state.clocks, now);

    if (elapsedState.timedOutColor) {
      const timeoutState = applyTimeoutState(
        state.chess,
        elapsedState.clocks,
        elapsedState.timedOutColor,
      );
      set({
        clocks: timeoutState.clocks,
        status: timeoutState.status,
        result: timeoutState.result,
      });
      return;
    }

    if (elapsedState.clocks !== state.clocks) {
      set({ clocks: elapsedState.clocks });
    }
  },

  flipBoard: () => {
    set((state) => ({
      boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
      config: {
        ...state.config,
        autoFlip: false,
      },
    }));
  },

  setAutoFlip: (enabled) => {
    set((state) => ({
      config: {
        ...state.config,
        autoFlip: enabled,
      },
      boardOrientation: enabled ? turnToOrientation(state.turn) : state.boardOrientation,
    }));
  },

  setAutoPromoteToQueen: (enabled) => {
    set((state) => ({
      config: {
        ...state.config,
        autoPromoteToQueen: enabled,
      },
    }));
  },

  getLegalTargets: (square) => {
    const state = get();
    if (state.result || state.pendingPromotion) return [];
    return getLocalMoveTargets(state.chess, square);
  },

  attemptMove: (from, to, promotionPiece) => {
    const state = get();
    const { chess, boardOrientation, config, result, clocks } = state;

    if (result) {
      return { ok: false, requiresPromotion: false };
    }

    const now = Date.now();
    const elapsedState = getClocksAfterElapsed(clocks, now);
    if (elapsedState.timedOutColor) {
      const timeoutState = applyTimeoutState(
        chess,
        elapsedState.clocks,
        elapsedState.timedOutColor,
      );
      set({
        clocks: timeoutState.clocks,
        status: timeoutState.status,
        result: timeoutState.result,
      });
      return { ok: false, requiresPromotion: false };
    }

    const pieceOnFrom = chess.get(from as ChessJsSquare);
    if (!pieceOnFrom) {
      return { ok: false, requiresPromotion: false };
    }

    if (pieceOnFrom.color !== chess.turn()) {
      return { ok: false, requiresPromotion: false };
    }

    const needsPromotion = isPromotionMove(chess, from, to);
    if (needsPromotion && !config.autoPromoteToQueen && !promotionPiece) {
      set({
        clocks: elapsedState.clocks,
        pendingPromotion: {
          from,
          to,
          color: pieceOnFrom.color,
        },
      });
      return { ok: false, requiresPromotion: true };
    }

    const requestedPromotion = config.autoPromoteToQueen
      ? ('q' as PromotionSymbol)
      : toPromotionSymbol(promotionPiece);

    try {
      const playedMove = chess.move({
        from,
        to,
        ...(requestedPromotion ? { promotion: requestedPromotion } : {}),
      });

      const nextTurn = chess.turn();
      const status = deriveStatusAndResult(chess);
      const moveHistory = chess.history();

      const isWhiteMove = playedMove.color === 'w';
      const incrementedClocks: LocalClockState = {
        ...elapsedState.clocks,
        whiteMs: isWhiteMove
          ? elapsedState.clocks.whiteMs + elapsedState.clocks.incrementMs
          : elapsedState.clocks.whiteMs,
        blackMs: !isWhiteMove
          ? elapsedState.clocks.blackMs + elapsedState.clocks.incrementMs
          : elapsedState.clocks.blackMs,
      };

      const nextClockState: LocalClockState = status.result
        ? {
            ...incrementedClocks,
            activeColor: null,
            started: true,
            lastTickAt: null,
          }
        : {
            ...incrementedClocks,
            activeColor: nextTurn,
            started: true,
            lastTickAt: now,
          };

      set({
        fen: chess.fen(),
        turn: nextTurn,
        status: status.status,
        result: status.result,
        moveHistory,
        lastMove: {
          from: playedMove.from as Square,
          to: playedMove.to as Square,
          san: playedMove.san,
          color: playedMove.color,
          isCapture: Boolean(playedMove.captured),
        },
        clocks: nextClockState,
        boardOrientation: config.autoFlip ? turnToOrientation(nextTurn) : boardOrientation,
        pendingPromotion: null,
        ...deriveCheckState(chess),
        ...deriveKingSquares(chess),
      });

      return { ok: true, requiresPromotion: false };
    } catch {
      return { ok: false, requiresPromotion: false };
    }
  },

  confirmPromotion: (piece) => {
    const { pendingPromotion } = get();
    if (!pendingPromotion) return false;

    const expectedPrefix = pendingPromotion.color;
    if (!piece.startsWith(expectedPrefix)) {
      return false;
    }

    return get().attemptMove(pendingPromotion.from, pendingPromotion.to, piece).ok;
  },

  cancelPromotion: () => {
    set({ pendingPromotion: null });
  },
}));

export function getPromotionOptions(color: Color): Piece[] {
  return [
    toBoardPiece(color, 'q'),
    toBoardPiece(color, 'r'),
    toBoardPiece(color, 'b'),
    toBoardPiece(color, 'n'),
  ];
}

export const LOCAL_CHESS_START_FEN = START_FEN;
