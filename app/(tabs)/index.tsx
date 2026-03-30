import { Alert, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, YStack } from 'tamagui';

import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { ChessButton } from '@/components/ui/ChessButton';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function HomeScreen() {
  const { profile, isSigningOut, signOut } = useAuthProfile();
  const isFocused = useIsFocused();
  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.back(0.9)),
      delay: 40,
      useNativeDriver: true,
    }).start();
  }, [isFocused, screenAnim]);

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    Alert.alert('Deconnecte', 'Vous etes deconnecte.');
  }

  return (
    <View flex={1} backgroundColor="$background">
      <Animated.View
        style={{
          flex: 1,
          opacity: screenAnim,
          transform: [
            {
              translateY: screenAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
            {
              scale: screenAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        }}
      >
        <YStack flex={1} p="$4" gap="$3" paddingTop={120} paddingBottom={120}>
        <ProfileMenu
          name={profile.name}
          email={profile.email}
          isSigningOut={isSigningOut}
          onSignOut={handleSignOut}
        />

        <YStack gap="$3" width="fit-content" alignItems="center">
          <ChessButton variant="primary" size="lg">
            Jouer maintenant
          </ChessButton>
          <ChessButton variant="secondary" size="lg">
            Parametres du plateau
          </ChessButton>
        </YStack>
        </YStack>
      </Animated.View>
    </View>
  );
}
