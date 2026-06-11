import { Animated } from 'react-native';
import { Input, Text, XStack, YStack, styled, useTheme } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import {
  type CadenceCategory,
  type CadenceOption,
} from '@/components/local-game/hooks/use-local-game-config';
import { type LocalTimeControlPresetKey } from '@/constants/local-time-controls';
import { CadenceTabs } from './CadenceTabs';
import { ConfigSectionLabel } from './SectionLabel';

const CustomCadenceInput = styled(Input, {
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$buttonSecondaryBorder',
  backgroundColor: '$light',
  color: '$dark',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$3',
});

type CadenceSectionProps = {
  activeCategory: CadenceCategory;
  selectedCadenceKey: LocalTimeControlPresetKey | null;
  visibleCadences: CadenceOption[];
  customMinutesInput: string;
  customIncrementInput: string;
  isCustomCategoryActive: boolean;
  indicatorWidth: number;
  tabIndicatorX: Animated.Value;
  onCategoryPress: (category: CadenceCategory) => void;
  onTabLayout: (category: CadenceCategory, layout: { x: number; width: number }) => void;
  onCadencePress: (key: LocalTimeControlPresetKey) => void;
  onCustomMinutesChange: (value: string) => void;
  onCustomIncrementChange: (value: string) => void;
};

export function CadenceSection({
  activeCategory,
  selectedCadenceKey,
  visibleCadences,
  customMinutesInput,
  customIncrementInput,
  isCustomCategoryActive,
  indicatorWidth,
  tabIndicatorX,
  onCategoryPress,
  onTabLayout,
  onCadencePress,
  onCustomMinutesChange,
  onCustomIncrementChange,
}: CadenceSectionProps) {
  const theme = useTheme();

  return (
    <YStack gap="$3">
      <ConfigSectionLabel>Cadence</ConfigSectionLabel>

      <CadenceTabs
        activeCategory={activeCategory}
        indicatorWidth={indicatorWidth}
        tabIndicatorX={tabIndicatorX}
        activeColor={theme.dark.val}
        inactiveColor={theme.interactionGrey.val}
        onCategoryPress={onCategoryPress}
        onTabLayout={onTabLayout}
      />

      <XStack flexWrap="wrap" justifyContent="center" gap="$3">
        {visibleCadences.map((option) => (
          <YStack key={`${option.category}-${option.key}`}>
            <ChessButton
              variant="selectableCard"
              size="sm"
              selected={selectedCadenceKey === option.key}
              onPress={() => onCadencePress(option.key)}
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
              onChangeText={onCustomMinutesChange}
              keyboardType="numeric"
              placeholder="10"
              maxLength={2}
              placeholderTextColor={theme.interactionGrey.val}
            />
          </YStack>

          <YStack gap="$1" flex={1}>
            <Text color="$dark" fontSize="$3" fontWeight="600">
              Incrément (s)
            </Text>
            <CustomCadenceInput
              value={customIncrementInput}
              onChangeText={onCustomIncrementChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="0"
              placeholderTextColor={theme.interactionGrey.val}
            />
          </YStack>
        </XStack>
      ) : null}
    </YStack>
  );
}
