import { type ReactNode } from 'react';
import { ChessRook, Shuffle } from 'lucide-react-native';
import { Text, XStack, YStack, useTheme } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import { type SideChoice } from '@/components/local-game/hooks/use-local-game-config';
import { ConfigSectionLabel } from './SectionLabel';

type SideSelectionSectionProps = {
  selectedSide: SideChoice;
  onSelectSide: (side: SideChoice) => void;
};

type SideChoiceOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon: ReactNode;
};

function SideChoiceOption({ label, selected, onPress, icon }: SideChoiceOptionProps) {
  return (
    <YStack alignItems="center" gap="$2" flex={1}>
      <ChessButton
        variant="selectableCard"
        shape="circle"
        size="iconLg"
        selected={selected}
        onPress={onPress}
        iconLeft={icon}
      />
      <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
        {label}
      </Text>
    </YStack>
  );
}

export function SideSelectionSection({ selectedSide, onSelectSide }: SideSelectionSectionProps) {
  const theme = useTheme();

  return (
    <YStack gap="$3">
      <ConfigSectionLabel>Couleur</ConfigSectionLabel>

      <XStack justifyContent="space-between" gap="$3">
        <SideChoiceOption
          label="Blancs"
          selected={selectedSide === 'white'}
          onPress={() => onSelectSide('white')}
          icon={
            <Text color={selectedSide === 'white' ? theme.light.val : theme.dark.val}>
              <ChessRook size={24} fill={theme.light.val} />
            </Text>
          }
        />

        <SideChoiceOption
          label="Aléatoire"
          selected={selectedSide === 'random'}
          onPress={() => onSelectSide('random')}
          icon={
            <Shuffle
              size={24}
              color={selectedSide === 'random' ? theme.light.val : theme.dark.val}
            />
          }
        />

        <SideChoiceOption
          label="Noirs"
          selected={selectedSide === 'black'}
          onPress={() => onSelectSide('black')}
          icon={
            <Text color={selectedSide === 'black' ? theme.light.val : theme.dark.val}>
              <ChessRook size={24} fill={theme.dark.val} />
            </Text>
          }
        />
      </XStack>
    </YStack>
  );
}
