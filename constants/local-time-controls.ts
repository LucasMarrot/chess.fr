export type LocalTimeControlPresetKey = '10_0' | '5_0' | '3_0' | '10_30' | '5_15' | '3_5';

export type LocalTimeControlPreset = {
  key: LocalTimeControlPresetKey;
  label: string;
  description: string;
  baseMinutes: number;
  incrementSeconds: number;
};

export const LOCAL_TIME_CONTROLS: LocalTimeControlPreset[] = [
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

export function getLocalTimeControlByKey(input?: string | string[]): LocalTimeControlPreset {
  const key = Array.isArray(input) ? input[0] : input;
  return (
    LOCAL_TIME_CONTROLS.find((control) => control.key === key) ??
    LOCAL_TIME_CONTROLS.find((control) => control.key === DEFAULT_TIME_CONTROL_KEY)!
  );
}
