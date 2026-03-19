import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Paragraph, Separator, Text, View, XStack, YStack } from 'tamagui';
import { ChessButton } from '@/components/ui/ChessButton';

export default function HomeScreen() {
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoadingDemo(true);
    setTimeout(() => setIsLoadingDemo(false), 1400);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 42 }}>
      <YStack p="$4" gap="$4">
        <YStack gap="$1">
          <Text fontSize="$8" fontWeight="700">
            Demo Boutons
          </Text>
          <Paragraph size="$4" color="$color">
            Variantes primary/secondary, tailles et etats interactifs.
          </Paragraph>
        </YStack>

        <Separator />

        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="700">
            Variantes
          </Text>
          <YStack gap="$3" flexWrap="wrap">
            <ChessButton
              variant="primary"
              iconLeft={<Feather name="play" size={16} color={'white'} />}
            >
              Jouer
            </ChessButton>
            <ChessButton variant="secondary">Parametres</ChessButton>
          </YStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="700">
            Tailles
          </Text>
          <XStack gap="$3" flexWrap="wrap" alignItems="center">
            <ChessButton variant="primary" size="sm">
              Small
            </ChessButton>
            <ChessButton variant="primary" size="md">
              Medium
            </ChessButton>
            <ChessButton variant="primary" size="lg">
              Large
            </ChessButton>
            <ChessButton
              variant="secondary"
              size="icon"
              iconLeft={<Feather name="circle" size={16} />}
            />
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="700">
            Etats
          </Text>
          <XStack gap="$3" flexWrap="wrap" alignItems="center">
            <ChessButton variant="primary" disabled>
              Disabled
            </ChessButton>
            <ChessButton variant="primary" loading={isLoadingDemo} onPress={handleLoadingDemo}>
              Loading
            </ChessButton>
            <ChessButton variant="secondary" iconLeft={<Feather name="play" size={16} />}>
              Icône gauche
            </ChessButton>
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="700">
            Full width
          </Text>
          <View width="100%" maxWidth={520}>
            <ChessButton variant="primary" fullWidth>
              Nouvelle partie classee
            </ChessButton>
          </View>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
