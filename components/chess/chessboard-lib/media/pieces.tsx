import React from 'react';
import { View, Image } from 'react-native';
import type { CustomPieceFn } from '../types';

// Import direct des PNG locaux
const PawnW = require('../../../../assets/images/pieces/pawnW.png');
const PawnB = require('../../../../assets/images/pieces/pawnB.png');
const RookW = require('../../../../assets/images/pieces/rookW.png');
const RookB = require('../../../../assets/images/pieces/rookB.png');
const KnightW = require('../../../../assets/images/pieces/knightW.png');
const KnightB = require('../../../../assets/images/pieces/knightB.png');
const BishopW = require('../../../../assets/images/pieces/bishopW.png');
const BishopB = require('../../../../assets/images/pieces/bishopB.png');
const QueenW = require('../../../../assets/images/pieces/queenW.png');
const QueenB = require('../../../../assets/images/pieces/queenB.png');
const KingW = require('../../../../assets/images/pieces/kingW.png');
const KingB = require('../../../../assets/images/pieces/kingB.png');

const SIZE_RATIO = 0.75; // Ajustez ce ratio pour augmenter ou diminuer la taille des pièces
const DRAGGING_SIZE_RATIO = 1; // Ratio pour les pièces en cours de déplacement

const createImagePiece = (imageSource: any): CustomPieceFn => {
  return ({ squareWidth, isDragging }) => {
    const size = Math.round(squareWidth * (isDragging ? DRAGGING_SIZE_RATIO : SIZE_RATIO));

    return (
      <View
        style={{
          width: squareWidth,
          height: squareWidth,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: isDragging ? 0.9 : 1,
        }}
      >
        <Image source={imageSource} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
    );
  };
};

// --- PIÈCES BLANCHES ---
export const wP = createImagePiece(PawnW);
export const wR = createImagePiece(RookW);
export const wN = createImagePiece(KnightW);
export const wB = createImagePiece(BishopW);
export const wQ = createImagePiece(QueenW);
export const wK = createImagePiece(KingW);

// --- PIÈCES NOIRES ---
export const bP = createImagePiece(PawnB);
export const bR = createImagePiece(RookB);
export const bN = createImagePiece(KnightB);
export const bB = createImagePiece(BishopB);
export const bQ = createImagePiece(QueenB);
export const bK = createImagePiece(KingB);

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
