type PresetLocalTimeControlPresetKey =
  | '1_0'
  | '1_2'
  | '3_0'
  | '3_2'
  | '5_0'
  | '10_0'
  | '15_10'
  | '30_0'
  | '10_30'
  | '5_15'
  | '3_5';

type CustomLocalTimeControlPresetKey = `custom_${number}_${number}`;

export type LocalTimeControlPresetKey =
  | PresetLocalTimeControlPresetKey
  | CustomLocalTimeControlPresetKey;

export type LocalTimeControlPreset = {
  key: LocalTimeControlPresetKey;
  label: string;
  description: string;
  baseMinutes: number;
  incrementSeconds: number;
};

export const LOCAL_TIME_CONTROLS: LocalTimeControlPreset[] = [
  {
    key: '1_0',
    label: '1|0',
    description: '1 minute sans increment',
    baseMinutes: 1,
    incrementSeconds: 0,
  },
  {
    key: '3_2',
    label: '3|2',
    description: '3 minutes + 2 secondes par coup',
    baseMinutes: 3,
    incrementSeconds: 2,
  },
  {
    key: '10_0',
    label: '10|0',
    description: '10 minutes sans increment',
    baseMinutes: 10,
    incrementSeconds: 0,
  },
  {
    key: '5_0',
    label: '5|0',
    description: '5 minutes sans increment',
    baseMinutes: 5,
    incrementSeconds: 0,
  },
  {
    key: '3_0',
    label: '3|0',
    description: '3 minutes sans increment',
    baseMinutes: 3,
    incrementSeconds: 0,
  },
  {
    key: '15_10',
    label: '15|10',
    description: '15 minutes + 10 secondes par coup',
    baseMinutes: 15,
    incrementSeconds: 10,
  },
  {
    key: '30_0',
    label: '30|0',
    description: '30 minutes sans increment',
    baseMinutes: 30,
    incrementSeconds: 0,
  },
  {
    key: '10_30',
    label: '10|30',
    description: '10 minutes + 30 secondes par coup',
    baseMinutes: 10,
    incrementSeconds: 30,
  },
  {
    key: '5_15',
    label: '5|15',
    description: '5 minutes + 15 secondes par coup',
    baseMinutes: 5,
    incrementSeconds: 15,
  },
  {
    key: '3_5',
    label: '3|5',
    description: '3 minutes + 5 secondes par coup',
    baseMinutes: 3,
    incrementSeconds: 5,
  },
];

const DEFAULT_TIME_CONTROL_KEY: LocalTimeControlPresetKey = '3_5';

function toCustomKey(
  baseMinutes: number,
  incrementSeconds: number,
): CustomLocalTimeControlPresetKey {
  return `custom_${baseMinutes}_${incrementSeconds}`;
}

function parseCustomTimeControlKey(key: string): {
  baseMinutes: number;
  incrementSeconds: number;
} | null {
  const match = /^custom_(\d+)_(\d+)$/.exec(key);
  if (!match) return null;

  const baseMinutes = Number(match[1]);
  const incrementSeconds = Number(match[2]);

  if (!Number.isFinite(baseMinutes) || !Number.isFinite(incrementSeconds)) return null;
  if (baseMinutes <= 0 || incrementSeconds < 0) return null;

  return { baseMinutes, incrementSeconds };
}

export function createCustomLocalTimeControlKey(
  baseMinutes: number,
  incrementSeconds: number,
): LocalTimeControlPresetKey {
  const safeMinutes = Math.max(1, Math.floor(baseMinutes));
  const safeIncrement = Math.max(0, Math.floor(incrementSeconds));
  return toCustomKey(safeMinutes, safeIncrement);
}

export function createCustomLocalTimeControl(
  baseMinutes: number,
  incrementSeconds: number,
): LocalTimeControlPreset {
  const key = createCustomLocalTimeControlKey(baseMinutes, incrementSeconds);
  const safeMinutes = Math.max(1, Math.floor(baseMinutes));
  const safeIncrement = Math.max(0, Math.floor(incrementSeconds));
  return {
    key,
    label: `${safeMinutes}|${safeIncrement}`,
    description: `${safeMinutes} minutes + ${safeIncrement} secondes par coup`,
    baseMinutes: safeMinutes,
    incrementSeconds: safeIncrement,
  };
}

export function getLocalTimeControlByKey(input?: string | string[]): LocalTimeControlPreset {
  const key = Array.isArray(input) ? input[0] : input;

  if (key) {
    const parsedCustom = parseCustomTimeControlKey(key);
    if (parsedCustom) {
      return createCustomLocalTimeControl(parsedCustom.baseMinutes, parsedCustom.incrementSeconds);
    }
  }

  return (
    LOCAL_TIME_CONTROLS.find((control) => control.key === key) ??
    LOCAL_TIME_CONTROLS.find((control) => control.key === DEFAULT_TIME_CONTROL_KEY)!
  );
}
