import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Text, View, YStack, getTokens } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import {
  LOCAL_TIME_CONTROLS,
  type LocalTimeControlPreset,
  type LocalTimeControlPresetKey,
} from '@/constants/local-time-controls';

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  timeControlCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});

export default function LocalGameConfigScreen() {
  const tokens = getTokens();
  const router = useRouter();

  function launchLocalGame(timeControl: LocalTimeControlPreset) {
    router.replace({
      pathname: '/local-game/play',
      params: {
        timeControl: timeControl.key,
      } satisfies { timeControl: LocalTimeControlPresetKey },
    });
  }

  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center" p="$4">
      <YStack
        width="100%"
        maxWidth={420}
        style={[
          styles.card,
          {
            backgroundColor: tokens.color.light.val,
            borderColor: tokens.color.buttonPrimaryBorder.val,
          },
        ]}
      >
        <Text color={tokens.color.dark.val} fontSize="$5" fontWeight="700">
          Choisir une cadence
        </Text>
        <Text color={tokens.color.interactionGrey.val} fontSize="$3">
          Lance une partie locale 2 joueurs sur le meme ecran.
        </Text>

        {LOCAL_TIME_CONTROLS.map((control) => (
          <Pressable
            key={control.key}
            onPress={() => launchLocalGame(control)}
            style={[
              styles.timeControlCard,
              {
                borderColor: tokens.color.buttonPrimaryBorder.val,
                backgroundColor: tokens.color.light.val,
              },
            ]}
          >
            <Text color={tokens.color.dark.val} fontWeight="700" fontSize="$4">
              {control.label}
            </Text>
            <Text color={tokens.color.interactionGrey.val} fontSize="$2">
              {control.description}
            </Text>
          </Pressable>
        ))}

        <ChessButton variant="secondary" size="md" onPress={() => router.replace('/(tabs)')}>
          Annuler
        </ChessButton>
      </YStack>
    </View>
  );
}
