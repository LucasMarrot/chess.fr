import React from 'react';
import { Users } from 'lucide-react-native';
import { ChessButton } from '@/components/ui/ChessButton';
import { useTheme } from 'tamagui';

type FriendsButtonProps = {
  onPress: () => void;
};

export function FriendsButton({ onPress }: FriendsButtonProps) {
  const theme = useTheme();

  return (
    <ChessButton
      variant="secondary"
      shape="circle"
      size="icon"
      onPress={onPress}
      iconLeft={<Users size={20} color={theme.dark?.val || 'black'} />}
    />
  );
}
