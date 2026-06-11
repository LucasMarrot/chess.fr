import type { Color } from 'chess.js';

import type { LocalTimeControlPreset } from '@/constants/local-time-controls';
import type { LocalGameResult } from '@/components/chess/stores/use-local-chess-game-store';
import { supabase } from '@/lib/supabase';

export type EloCategory = 'bullet' | 'blitz' | 'rapid';

export function getEloCategory(timeControl: LocalTimeControlPreset): EloCategory {
  if (timeControl.baseMinutes <= 1) return 'bullet';
  if (timeControl.baseMinutes <= 5) return 'blitz';
  return 'rapid';
}

function getScoreForColor(result: LocalGameResult, color: Color) {
  if (result.outcome === 'draw') return 0.5;
  return result.winner === color ? 1 : 0;
}

export async function submitRankedGameResult({
  roomId,
  category,
  whitePlayerId,
  blackPlayerId,
  result,
}: {
  roomId: string;
  category: EloCategory;
  whitePlayerId: string;
  blackPlayerId: string;
  result: LocalGameResult;
}) {
  const whiteScore = getScoreForColor(result, 'w');

  return supabase.rpc('submit_ranked_game_result', {
    p_room_id: roomId,
    p_category: category,
    p_white_player_id: whitePlayerId,
    p_black_player_id: blackPlayerId,
    p_white_score: whiteScore,
  });
}

