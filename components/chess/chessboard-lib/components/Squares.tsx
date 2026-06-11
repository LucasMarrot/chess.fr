import React, { useMemo, useState } from 'react';
import { Draggable, Droppable } from '@mgcrea/react-native-dnd';
import { View } from 'react-native';
import { COLUMNS } from '../consts';
import { useChessboard } from '../context/chessboard-context';
import type { Coords, Piece as Pc, Square as Sq } from '../types';
import { Notation } from './Notation';
import { Piece } from './Piece';
import { Square } from './Square';

type PremovesHistory = {
  piece: Pc;
  premovesRoute: { sourceSq: Sq; targetSq: Sq; index: number }[];
}[];

export function Squares() {
  const [squares, setSquares] = useState<{ [square in Sq]?: Coords }>({});

  const {
    arePremovesAllowed,
    boardOrientation,
    boardWidth,
    currentPosition,
    id,
    isWaitingForAnimation,
    onPromotionCheck,
    positionDifferences,
    premoves,
    showBoardNotation,
    isDraggablePiece,
    arePiecesDraggable,
  } = useChessboard();

  const movingSourceRanks = useMemo(() => {
    if (!isWaitingForAnimation) return new Set<number>();

    const ranks = new Set<number>();
    const addedEntries = Object.entries(positionDifferences.added) as [Sq, Pc][];

    (Object.entries(positionDifferences.removed) as [Sq, Pc][]).forEach(
      ([sourceSquare, removedPiece]) => {
        const isMovingPiece = addedEntries.some(([targetSquare, targetPiece]) => {
          if (targetPiece === removedPiece) return true;
          return onPromotionCheck(sourceSquare, targetSquare, removedPiece);
        });

        if (!isMovingPiece) return;
        const rank = Number(sourceSquare[1]);
        if (!Number.isNaN(rank)) ranks.add(rank);
      },
    );

    return ranks;
  }, [
    isWaitingForAnimation,
    onPromotionCheck,
    positionDifferences.added,
    positionDifferences.removed,
  ]);

  const premovesHistory: PremovesHistory = useMemo(() => {
    const result: PremovesHistory = [];
    if (!arePremovesAllowed) return [];

    premoves.forEach((premove: { sourceSq: Sq; targetSq: Sq; piece: Pc }, index: number) => {
      const { sourceSq, targetSq, piece } = premove;

      const relatedPremovedPiece = result.find(
        (p: PremovesHistory[number]) =>
          p.piece === piece && p.premovesRoute.at(-1)?.targetSq === sourceSq,
      );

      if (relatedPremovedPiece) {
        relatedPremovedPiece.premovesRoute.push({ sourceSq, targetSq, index });
      } else {
        result.push({
          piece,
          premovesRoute: [{ sourceSq, targetSq, index }],
        });
      }
    });

    return result;
  }, [premoves]);

  return (
    <View testID={`boardid-${id}`}>
      {[...Array(8)].map((_, r) => {
        const rowRank = boardOrientation === 'black' ? r + 1 : 8 - r;
        const rowIsAnimating = movingSourceRanks.has(rowRank);

        return (
          <View
            key={r.toString()}
            style={{
              position: 'relative',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              width: boardWidth,
              zIndex: rowIsAnimating ? 950 : 1,
              elevation: rowIsAnimating ? 950 : 0,
            }}
          >
            {[...Array(8)].map((_, c) => {
              const square =
                boardOrientation === 'black'
                  ? ((COLUMNS[7 - c]! + (r + 1)) as Sq)
                  : ((COLUMNS[c]! + (8 - r)) as Sq);
              const squareColor = c % 2 === r % 2 ? 'white' : 'black';
              const squareHasPremove = premoves.find(
                (p: { sourceSq: Sq; targetSq: Sq; piece: Pc }) =>
                  p.sourceSq === square || p.targetSq === square,
              );

              const squareHasPremoveTarget = premovesHistory
                .filter(({ premovesRoute }) => premovesRoute.at(-1)?.targetSq === square)
                .sort((a, b) => b.premovesRoute.at(-1)?.index! - a.premovesRoute.at(-1)?.index!)
                .at(0);

              const canDrag =
                arePiecesDraggable &&
                isDraggablePiece({
                  piece: currentPosition[square] ?? ('' as Pc),
                  sourceSquare: square,
                });
              const piece = currentPosition[square];

              return (
                <View key={square} style={{ position: 'relative' }}>
                  <Droppable id={square} key={`drop-${square}`}>
                    <Square
                      key={square}
                      square={square}
                      squareColor={squareColor}
                      setSquares={setSquares}
                      squareHasPremove={!!squareHasPremove}
                    >
                      {!squareHasPremove && piece && (
                        <Draggable
                          id={`${square}-${piece}`}
                          key={`drag-${square}-${piece}`}
                          disabled={!canDrag}
                        >
                          <Piece piece={piece as Pc} square={square} squares={squares} />
                        </Draggable>
                      )}
                      {squareHasPremoveTarget && (
                        <Draggable
                          id={`${square}-${squareHasPremoveTarget.piece}`}
                          key={`drag-${square}-${squareHasPremoveTarget.piece}`}
                          disabled={true}
                        >
                          <Piece
                            isPremovedPiece={true}
                            piece={squareHasPremoveTarget.piece}
                            square={square}
                            squares={squares}
                          />
                        </Draggable>
                      )}
                      {showBoardNotation && <Notation row={r} col={c} />}
                    </Square>
                  </Droppable>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
