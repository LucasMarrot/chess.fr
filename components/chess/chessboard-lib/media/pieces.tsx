import React from 'react';
import {
  ChessBishop,
  ChessKing,
  ChessKnight,
  ChessPawn,
  ChessQueen,
  ChessRook,
} from 'lucide-react-native';

import type { CustomPieceFn } from '../types';

const LIGHT_FILL = '#f7f3ea';
const LIGHT_STROKE = '#1f1f1f';
const DARK_FILL = '#1b1b1b';
const DARK_STROKE = '#111111';

const createLucidePiece = (Icon: typeof ChessPawn, isWhite: boolean): CustomPieceFn => {
  return ({ squareWidth, isDragging }) => {
    const size = Math.round(squareWidth * (isDragging ? 0.92 : 0.88));
    const strokeWidth = isDragging ? 2.1 : 2;

    return (
      <Icon
        size={size}
        color={isWhite ? LIGHT_STROKE : DARK_STROKE}
        fill={isWhite ? LIGHT_FILL : DARK_FILL}
        strokeWidth={strokeWidth}
        style={{ opacity: isDragging ? 0.94 : 1 }}
      />
    );
  };
};

export const wP = createLucidePiece(ChessPawn, true);
export const wR = createLucidePiece(ChessRook, true);
export const wN = createLucidePiece(ChessKnight, true);
export const wB = createLucidePiece(ChessBishop, true);
export const wQ = createLucidePiece(ChessQueen, true);
export const wK = createLucidePiece(ChessKing, true);

export const bP = createLucidePiece(ChessPawn, false);
export const bR = createLucidePiece(ChessRook, false);
export const bN = createLucidePiece(ChessKnight, false);
export const bB = createLucidePiece(ChessBishop, false);
export const bQ = createLucidePiece(ChessQueen, false);
export const bK = createLucidePiece(ChessKing, false);

export const defaultPieces = {
  wP,
  wR,
  wN,
  wB,
  wQ,
  wK,
  bP,
  bR,
  bN,
  bB,
  bQ,
  bK,
};
