import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type { LocalTimeControlPresetKey } from '@/constants/local-time-controls';

export type OnlinePlayerColor = 'white' | 'black';

const DEFAULT_ONLINE_TIME_CONTROL: LocalTimeControlPresetKey = '3_5';

export function createOnlineRoomId() {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return randomPart
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase();
}

export function getDefaultOnlineTimeControlKey() {
  return DEFAULT_ONLINE_TIME_CONTROL;
}

export function getOpponentColor(color: OnlinePlayerColor): OnlinePlayerColor {
  return color === 'white' ? 'black' : 'white';
}

export function createOnlineGamePath({
  roomId,
  timeControl = DEFAULT_ONLINE_TIME_CONTROL,
  color,
}: {
  roomId: string;
  timeControl?: LocalTimeControlPresetKey;
  color: OnlinePlayerColor;
}) {
  return `/local-game/play?mode=online&roomId=${encodeURIComponent(
    roomId,
  )}&timeControl=${encodeURIComponent(timeControl)}&color=${color}`;
}

export function createOnlineInviteLink({
  roomId,
  timeControl,
  guestColor,
}: {
  roomId: string;
  timeControl: LocalTimeControlPresetKey;
  guestColor: OnlinePlayerColor;
}) {
  const path = createOnlineGamePath({ roomId, timeControl, color: guestColor });
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URL(path, window.location.origin).toString();
  }
  return Linking.createURL(path.replace(/^\//, ''));
}

export function decodeGameCode(code: string) {
  const trimmed = code.trim();
  if (trimmed.includes('mode=online')) {
    const match = trimmed.match(/[?&]roomId=([^&]+)/);
    return { roomId: match ? decodeURIComponent(match[1]) : '' };
  }
  return {
    roomId: trimmed
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase(),
  };
}
