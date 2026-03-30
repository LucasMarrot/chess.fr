import type { BoardOrientation, Square } from '../chessboard-lib/types';
import type { LocalGameResultReason } from '../stores/use-local-chess-game-store';
export { withAlpha } from '../utils';

import type { HistoryRow } from './types';

export function formatClock(ms: number): string {
  const clamped = Math.max(0, ms);

  if (clamped < 10_000) {
    const seconds = (clamped / 1000).toFixed(1);
    return `0:${seconds.padStart(4, '0')}`;
  }

  const totalSeconds = Math.ceil(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function colorToLabel(color: 'w' | 'b'): 'Blancs' | 'Noirs' {
  return color === 'w' ? 'Blancs' : 'Noirs';
}

export function resultReasonToLabel(reason: LocalGameResultReason): string {
  switch (reason) {
    case 'checkmate':
      return 'Echec et mat';
    case 'stalemate':
      return 'Pat';
    case 'threefold-repetition':
      return 'Nulle par repetition';
    case 'insufficient-material':
      return 'Nulle par materiel insuffisant';
    case 'fifty-move-rule':
      return 'Nulle par regle des 50 coups';
    case 'timeout':
      return 'Victoire au temps';
    case 'timeout-insufficient-material':
      return 'Nulle au temps (materiel insuffisant)';
    default:
      return 'Partie nulle';
  }
}

export function getSquareTopLeft(square: Square, orientation: BoardOrientation, boardSize: number) {
  const squareSize = boardSize / 8;
  const fileIndex = square.charCodeAt(0) - 97;
  const rankIndex = Number(square[1]) - 1;

  const col = orientation === 'white' ? fileIndex : 7 - fileIndex;
  const row = orientation === 'white' ? 7 - rankIndex : rankIndex;

  return {
    left: col * squareSize,
    top: row * squareSize,
    size: squareSize,
  };
}

export function toHistoryRows(history: string[]): HistoryRow[] {
  const rows: HistoryRow[] = [];

  for (let index = 0; index < history.length; index += 2) {
    rows.push({
      moveNumber: Math.floor(index / 2) + 1,
      white: history[index] ?? '-',
      black: history[index + 1] ?? '-',
    });
  }

  return rows;
}
