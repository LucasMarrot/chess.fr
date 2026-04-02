import { XStack } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';

import { localGameStyles } from './styles';

type LocalGameActionBarProps = {
  isAutoFlipEnabled: boolean;
  onExitPress: () => void;
  onFlipPress: () => void;
};

export const LocalGameActionBar = ({
  isAutoFlipEnabled,
  onExitPress,
  onFlipPress,
}: LocalGameActionBarProps) => {
  return (
    <XStack style={localGameStyles.actionsRow}>
      <ChessButton variant="rounded" size="md" onPress={onExitPress}>
        Quitter
      </ChessButton>
      <ChessButton variant="rounded" size="md" onPress={onFlipPress}>
        {isAutoFlipEnabled ? 'Auto-flip ON' : 'Flip'}
      </ChessButton>
    </XStack>
  );
};
