import { StyleSheet } from 'react-native';

import { View, YStack } from 'tamagui';
import { PrimaryButton, SecondaryButton } from '@/components/ui/ChessButton';

export default function HomeScreen() {
  return (
    <View>
      <YStack p="$4" gap="$3">
        <PrimaryButton size="$5">Jouer maintenant</PrimaryButton>

        <SecondaryButton size="$4">Paramètres du plateau</SecondaryButton>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
