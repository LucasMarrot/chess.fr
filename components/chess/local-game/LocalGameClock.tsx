import { Text, XStack } from 'tamagui';

import { AnimatedClockIcon } from './AnimatedClockIcon';
import { localGameStyles } from './styles';
import type { LocalGameClockModel, LocalGameTheme } from './types';
import { formatClock } from './utils';

type LocalGameClockProps = {
  clock: LocalGameClockModel;
  theme: LocalGameTheme;
};

export const LocalGameClock = ({ clock, theme }: LocalGameClockProps) => {
  const isWhiteClock = clock.color === 'white';

  return (
    <XStack
      style={localGameStyles.clockCard}
      borderColor={clock.isActive ? theme.primaryDark : theme.buttonPrimaryBorder}
      backgroundColor={isWhiteClock ? theme.light : theme.dark}
      alignSelf="center"
      gap={'$4'}
    >
      {clock.isActive && (
        <AnimatedClockIcon
          isActive={clock.isActive}
          color={isWhiteClock ? theme.dark : theme.light}
        />
      )}
      <Text color={isWhiteClock ? theme.dark : theme.light} fontSize="$8" width={110}>
        {formatClock(clock.clockMs)}
      </Text>
    </XStack>
  );
};
