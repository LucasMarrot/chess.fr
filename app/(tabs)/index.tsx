import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, View, YStack, getTokens } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import {
  LOCAL_TIME_CONTROLS,
  type LocalTimeControlPreset,
  type LocalTimeControlPresetKey,
} from '@/constants/local-time-controls';
import { AppHeader } from '@/components/headers/AppHeader';

const styles = StyleSheet.create({
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(19,18,17,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 30,
  },
  modalCard: {
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

export default function HomeScreen() {
  const tokens = getTokens();
  const router = useRouter();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function launchLocalGame(timeControl: LocalTimeControlPreset) {
    setIsPickerVisible(false);
    router.push({
      pathname: '/local-game',
      params: {
        timeControl: timeControl.key,
      } satisfies { timeControl: LocalTimeControlPresetKey },
    });
  }

  return (
    <>
      <AppHeader />
      <View
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        p="$4"
      >
        <YStack width="100%" maxWidth={360} alignItems="center" gap="$4">
          <ChessButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => setIsPickerVisible(true)}
          >
            Jouer une partie
          </ChessButton>
        </YStack>

        {isPickerVisible ? (
          <Pressable style={styles.modalBackdrop} onPress={() => setIsPickerVisible(false)}>
            <Pressable
              style={[
                styles.modalCard,
                {
                  backgroundColor: tokens.color.light.val,
                  borderColor: tokens.color.buttonPrimaryBorder.val,
                },
              ]}
              onPress={() => {}}
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

              <ChessButton variant="secondary" size="md" onPress={() => setIsPickerVisible(false)}>
                Annuler
              </ChessButton>
            </Pressable>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
