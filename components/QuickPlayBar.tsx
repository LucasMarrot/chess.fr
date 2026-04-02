import React from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import { XStack, YStack, styled } from 'tamagui';
import { ChessButton } from '@/components/ui/ChessButton';
import { BlurView } from 'expo-blur'; 

type QuickPlayBarProps = {
  onPlayOnline?: () => void;
  onPlayLocal?: () => void;
};

const Container = styled(XStack, {
  w: '100%',
  paddingHorizontal: '$6',
  paddingBottom: '$4',
  paddingTop: '$4',
  gap: '$4',
});

export default function QuickPlayBar({ onPlayOnline, onPlayLocal }: QuickPlayBarProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  if (isDesktop) {
    return null;
  }

  return (
    <BlurView intensity={20} tint="light" style={styles.blurWrapper}>
      <Container>
        <YStack flex={1}>
          <ChessButton
            variant="primary"
            size="lg"
            fullWidth
            onPress={onPlayOnline}
            textProps={{ fontFamily: '$body', fontWeight: '400', textTransform: 'none' }}
          >
            Jouer en ligne
          </ChessButton>
        </YStack>
        <YStack flex={1}>
          <ChessButton
            variant="secondary"
            size="lg"
            fullWidth
            onPress={onPlayLocal}
            textProps={{ fontFamily: '$body', fontWeight: '400', textTransform: 'none' }}
          >
            Jouer en local
          </ChessButton>
        </YStack>
      </Container>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopWidth: 0,
  },
});
