import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Clock3, Settings2, Shuffle, Timer, Zap } from 'lucide-react-native';
import { Animated, Easing, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Text, View, XStack, YStack, getTokens, styled } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import {
  createCustomLocalTimeControlKey,
  type LocalTimeControlPresetKey,
} from '@/constants/local-time-controls';

type CadenceCategory = 'bullet' | 'blitz' | 'rapid' | 'custom';
type PresetCadenceCategory = Exclude<CadenceCategory, 'custom'>;
type SideChoice = 'white' | 'random' | 'black';

type CadenceOption = {
  key: LocalTimeControlPresetKey;
  category: PresetCadenceCategory;
  label: string;
};

const CADENCE_CATEGORY_LABELS: Record<CadenceCategory, string> = {
  rapid: 'Rapide',
  blitz: 'Blitz',
  bullet: 'Bullet',
  custom: 'Perso',
};

const CADENCE_CATEGORY_ICONS: Record<CadenceCategory, typeof Zap> = {
  bullet: Zap,
  blitz: Timer,
  rapid: Clock3,
  custom: Settings2,
};

const CADENCE_OPTIONS: CadenceOption[] = [
  { key: '1_0', category: 'bullet', label: '1 min' },
  { key: '1_2', category: 'bullet', label: '1|2' },
  { key: '3_2', category: 'blitz', label: '3|2' },
  { key: '3_0', category: 'blitz', label: '3 min' },
  { key: '5_0', category: 'blitz', label: '5 min' },
  { key: '10_0', category: 'rapid', label: '10 min' },
  { key: '15_10', category: 'rapid', label: '15|10' },
  { key: '30_0', category: 'rapid', label: '30 min' },
];

const SECTION_LABEL_SPACING = 1;

const ScreenContent = styled(YStack, {
  width: '100%',
  maxWidth: 430,
  gap: '$5',
  paddingHorizontal: '$4',
  paddingBottom: '$7',
  paddingTop: '$4',
});

const SectionLabel = styled(Text, {
  color: '$interactionGrey',
  fontSize: '$4',
  fontWeight: '400',
  letterSpacing: SECTION_LABEL_SPACING,
});

const CadenceTabsContainer = styled(XStack, {
  width: '100%',
  backgroundColor: '$transparent',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$3',
  paddingHorizontal: '$1',
  position: 'relative',
});

const CadenceTabButton = styled(Button, {
  chromeless: true,
  backgroundColor: 'transparent',
  borderWidth: 0,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  paddingVertical: '$1',
  variants: {
    active: {
      true: {
        opacity: 1,
        scale: 1,
      },
      false: {
        opacity: 0.7,
        scale: 0.96,
      },
    },
  } as const,
});

const CadenceTabLabel = styled(Text, {
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '400',
  variants: {
    active: {
      true: {
        color: '$dark',
      },
      false: {
        color: '$interactionGrey',
      },
    },
  } as const,
});

const CustomCadenceInput = styled(Input, {
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$buttonSecondaryBorder',
  backgroundColor: '$light',
  color: '$dark',
  height: 'fit-content',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$3',
});

const styles = StyleSheet.create({
  tabIndicator: {
    height: 3,
    width: 44,
    borderRadius: 2,
    position: 'absolute',
    top: 4,
    left: 0,
  },
});

export default function LocalGameConfigScreen() {
  const tokens = getTokens();
  const router = useRouter();
  const tabIndicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = 44;

  const [activeCategory, setActiveCategory] = useState<CadenceCategory>('rapid');
  const [selectedCadenceKey, setSelectedCadenceKey] = useState<LocalTimeControlPresetKey | null>(
    null,
  );
  const [selectedSide, setSelectedSide] = useState<SideChoice>('random');
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [customIncrementInput, setCustomIncrementInput] = useState('');
  const [tabLayouts, setTabLayouts] = useState<
    Record<CadenceCategory, { x: number; width: number } | null>
  >({
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
    return CADENCE_OPTIONS.filter((option) => option.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const activeLayout = tabLayouts[activeCategory];
    if (!activeLayout) return;

    const target = activeLayout.x + (activeLayout.width - indicatorWidth) / 2;

    Animated.timing(tabIndicatorX, {
      toValue: target,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeCategory, indicatorWidth, tabIndicatorX, tabLayouts]);

  function sanitizeNumericInput(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  function launchLocalGame() {
    if (!resolvedCadenceKey) return;

    router.replace({
      pathname: '/local-game/play',
      params: {
        timeControl: resolvedCadenceKey,
        color: selectedSide,
      },
    });
  }

  return (
    <View flex={1} backgroundColor="$light">
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <ScreenContent height={'calc(100dvh - 64px)'}>
          <YStack gap="$3">
            <SectionLabel>Cadence</SectionLabel>

            <CadenceTabsContainer>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: tokens.color.dark.val,
                    transform: [{ translateX: tabIndicatorX }],
                  },
                ]}
              />

              {(Object.keys(CADENCE_CATEGORY_LABELS) as CadenceCategory[]).map((category) => {
                const CategoryIcon = CADENCE_CATEGORY_ICONS[category];
                const isSelectedCategory = activeCategory === category;

                return (
                  <YStack
                    key={category}
                    flex={1}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      setTabLayouts((prev) => ({ ...prev, [category]: { x, width } }));
                    }}
                  >
                    <CadenceTabButton
                      active={isSelectedCategory}
                      onPress={() => {
                        setActiveCategory(category);
                        if (category === 'custom') {
                          setSelectedCadenceKey(null);
                        }
                      }}
                    >
                      <CategoryIcon
                        size={16}
                        color={
                          isSelectedCategory
                            ? tokens.color.dark.val
                            : tokens.color.interactionGrey.val
                        }
                      />
                      <CadenceTabLabel active={isSelectedCategory}>
                        {CADENCE_CATEGORY_LABELS[category]}
                      </CadenceTabLabel>
                    </CadenceTabButton>
                  </YStack>
                );
              })}
            </CadenceTabsContainer>

            <XStack flexWrap="wrap" justifyContent="center" gap="$3">
              {visibleCadences.map((option) => (
                <YStack key={`${option.category}-${option.key}`}>
                  <ChessButton
                    variant="selectableCard"
                    size="sm"
                    selected={selectedCadenceKey === option.key}
                    onPress={() => {
                      setSelectedCadenceKey(option.key);
                      setCustomMinutesInput('');
                      setCustomIncrementInput('');
                    }}
                  >
                    {option.label}
                  </ChessButton>
                </YStack>
              ))}
            </XStack>

            {isCustomCategoryActive ? (
              <XStack gap="$3">
                <YStack gap="$1" flex={1}>
                  <Text color="$dark" fontSize="$3" fontWeight="600">
                    Temps (min)
                  </Text>
                  <CustomCadenceInput
                    value={customMinutesInput}
                    onChangeText={(nextValue) => {
                      setSelectedCadenceKey(null);
                      setCustomMinutesInput(sanitizeNumericInput(nextValue));
                    }}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor="$interactionGrey"
                  />
                </YStack>

                <YStack gap="$1" flex={1}>
                  <Text color="$dark" fontSize="$3" fontWeight="600">
                    Incrément (s)
                  </Text>
                  <CustomCadenceInput
                    value={customIncrementInput}
                    onChangeText={(nextValue) => {
                      setSelectedCadenceKey(null);
                      setCustomIncrementInput(sanitizeNumericInput(nextValue));
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="$interactionGrey"
                  />
                </YStack>
              </XStack>
            ) : undefined}
          </YStack>

          <YStack gap="$3">
            <SectionLabel>Couleur</SectionLabel>

            <XStack justifyContent="space-between" gap="$3">
              <YStack alignItems="center" gap="$2" flex={1}>
                <ChessButton
                  variant="selectableCard"
                  shape="circle"
                  size="iconLg"
                  selected={selectedSide === 'white'}
                  onPress={() => setSelectedSide('white')}
                  iconLeft={
                    <Text
                      color={selectedSide === 'white' ? '$light' : '$dark'}
                      fontSize="$7"
                      lineHeight={32}
                    >
                      {selectedSide === 'white' ? '♜' : '♖'}
                    </Text>
                  }
                />
                <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
                  Blancs
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$2" flex={1}>
                <ChessButton
                  variant="selectableCard"
                  shape="circle"
                  size="iconLg"
                  selected={selectedSide === 'random'}
                  onPress={() => setSelectedSide('random')}
                  iconLeft={
                    <Shuffle
                      size={22}
                      color={
                        selectedSide === 'random' ? tokens.color.light.val : tokens.color.dark.val
                      }
                    />
                  }
                />
                <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
                  Aléatoire
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$2" flex={1}>
                <ChessButton
                  variant="selectableCard"
                  shape="circle"
                  size="iconLg"
                  selected={selectedSide === 'black'}
                  onPress={() => setSelectedSide('black')}
                  iconLeft={
                    <Text
                      color={selectedSide === 'black' ? '$light' : '$dark'}
                      fontSize="$7"
                      lineHeight={32}
                    >
                      {selectedSide === 'black' ? '♖' : '♜'}
                    </Text>
                  }
                />
                <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
                  Noirs
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack gap="$2" flex={1} justifyContent="flex-end">
            <ChessButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canLaunchGame}
              onPress={launchLocalGame}
            >
              Lancer la partie
            </ChessButton>
          </YStack>
        </ScreenContent>
      </ScrollView>
    </View>
  );
}
