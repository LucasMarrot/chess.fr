import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Easing } from 'react-native';

import {
  LOCAL_TIME_CONTROLS,
  createCustomLocalTimeControlKey,
  type LocalTimeControlPreset,
  type LocalTimeControlPresetKey,
} from '@/constants/local-time-controls';
import { createOnlineRoomId } from '@/lib/online-chess';
import { supabase } from '@/lib/supabase';

export type CadenceCategory = 'bullet' | 'blitz' | 'rapid' | 'custom';
type PresetCadenceCategory = Exclude<CadenceCategory, 'custom'>;
export type SideChoice = 'white' | 'random' | 'black';

export type CadenceOption = {
  key: LocalTimeControlPresetKey;
  category: PresetCadenceCategory;
  label: string;
};

type TabLayout = { x: number; width: number };

const CADENCE_PRESET_ORDER = ['1_0', '1_2', '3_2', '3_0', '5_0', '10_0', '15_10', '30_0'] as const;

export const CADENCE_TAB_INDICATOR_WIDTH = 44;

function resolveCadenceCategory(control: LocalTimeControlPreset): PresetCadenceCategory {
  if (control.baseMinutes <= 1) return 'bullet';
  if (control.baseMinutes <= 5) return 'blitz';
  return 'rapid';
}

function formatCadenceLabel(control: LocalTimeControlPreset): string {
  return control.incrementSeconds > 0
    ? `${control.baseMinutes}|${control.incrementSeconds}`
    : `${control.baseMinutes} min`;
}

const PRESET_CADENCE_OPTIONS: CadenceOption[] = CADENCE_PRESET_ORDER.map((key) => {
  const control = LOCAL_TIME_CONTROLS.find((preset) => preset.key === key);
  if (!control) return null;

  return {
    key: control.key,
    category: resolveCadenceCategory(control),
    label: formatCadenceLabel(control),
  };
}).filter((option): option is CadenceOption => option !== null);

export function useLocalGameConfig() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isOnlineMode = mode === 'online';
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  const [activeCategory, setActiveCategory] = useState<CadenceCategory>('rapid');
  const [selectedCadenceKey, setSelectedCadenceKey] = useState<LocalTimeControlPresetKey | null>(
    null,
  );
  const [selectedSide, setSelectedSide] = useState<SideChoice>('random');
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [customIncrementInput, setCustomIncrementInput] = useState('');
  const [tabLayouts, setTabLayouts] = useState<Record<CadenceCategory, TabLayout | null>>({
    bullet: null,
    blitz: null,
    rapid: null,
    custom: null,
  });

  const customMinutes = useMemo(() => Number(customMinutesInput), [customMinutesInput]);
  const customIncrement = useMemo(() => Number(customIncrementInput), [customIncrementInput]);

  const customCadenceKey = useMemo(() => {
    if (!Number.isInteger(customMinutes) || !Number.isInteger(customIncrement)) return null;
    if (customMinutes <= 0 || customIncrement < 0) return null;
    return createCustomLocalTimeControlKey(customMinutes, customIncrement);
  }, [customIncrement, customMinutes]);

  const isCustomCategoryActive = activeCategory === 'custom';
  const resolvedCadenceKey = isCustomCategoryActive ? customCadenceKey : selectedCadenceKey;
  const canLaunchGame = resolvedCadenceKey !== null;

  const visibleCadences = useMemo(() => {
    if (activeCategory === 'custom') return [];
    return PRESET_CADENCE_OPTIONS.filter((option) => option.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const activeLayout = tabLayouts[activeCategory];
    if (!activeLayout) return;

    const target = activeLayout.x + (activeLayout.width - CADENCE_TAB_INDICATOR_WIDTH) / 2;

    Animated.timing(tabIndicatorX, {
      toValue: target,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeCategory, tabIndicatorX, tabLayouts]);

  const setTabLayout = useCallback((category: CadenceCategory, layout: TabLayout) => {
    setTabLayouts((previousLayouts) => {
      const previousLayout = previousLayouts[category];

      if (
        previousLayout &&
        previousLayout.x === layout.x &&
        previousLayout.width === layout.width
      ) {
        return previousLayouts;
      }

      return { ...previousLayouts, [category]: layout };
    });
  }, []);

  const selectCategory = useCallback((category: CadenceCategory) => {
    setActiveCategory(category);

    if (category === 'custom') {
      setSelectedCadenceKey(null);
    }
  }, []);

  const selectCadence = useCallback((key: LocalTimeControlPresetKey) => {
    setSelectedCadenceKey(key);
    setCustomMinutesInput('');
    setCustomIncrementInput('');
  }, []);

  const updateCustomMinutes = useCallback((value: string) => {
    setSelectedCadenceKey(null);
    setCustomMinutesInput(value.replace(/[^0-9]/g, ''));
  }, []);

  const updateCustomIncrement = useCallback((value: string) => {
    setSelectedCadenceKey(null);
    setCustomIncrementInput(value.replace(/[^0-9]/g, ''));
  }, []);

  const selectSide = useCallback((side: SideChoice) => {
    setSelectedSide(side);
  }, []);

  const launchLocalGame = useCallback(async () => {
    // <-- Ajoute 'async'
    if (!resolvedCadenceKey) return;

    if (isOnlineMode) {
      // 1. On génère un beau code de 6 lettres (ta fonction génère déjà ça si tu l'as modifiée)
      const roomId = createOnlineRoomId();
      const hostColor = selectedSide === 'black' ? 'black' : 'white';

      // 2. On sauvegarde la partie dans Supabase de façon invisible
      const { error } = await supabase.from('game_rooms').insert({
        id: roomId,
        time_control: resolvedCadenceKey,
        host_color: hostColor,
      });

      if (error) console.error('Erreur sauvegarde DB:', error);

      // 3. On route l'hôte vers la partie (comme avant)
      router.replace({
        pathname: '/local-game/play',
        params: {
          mode: 'online',
          roomId,
          color: hostColor,
          timeControl: resolvedCadenceKey,
        },
      });
    } else {
      router.replace({
        pathname: '/local-game/play',
        params: {
          color: selectedSide,
          timeControl: resolvedCadenceKey,
        },
      });
    }
  }, [isOnlineMode, resolvedCadenceKey, router, selectedSide]);

  return {
    activeCategory,
    selectedCadenceKey,
    selectedSide,
    customMinutesInput,
    customIncrementInput,
    isCustomCategoryActive,
    canLaunchGame,
    isOnlineMode,
    visibleCadences,
    tabIndicatorX,
    indicatorWidth: CADENCE_TAB_INDICATOR_WIDTH,
    selectCategory,
    selectCadence,
    updateCustomMinutes,
    updateCustomIncrement,
    selectSide,
    setTabLayout,
    launchLocalGame,
  };
}
