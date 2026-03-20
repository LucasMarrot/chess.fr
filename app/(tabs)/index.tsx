import { Alert } from 'react-native';
import { View, YStack } from 'tamagui';

import { ProfileMenu } from '@/components/profile/ProfileMenu';
import { ChessButton } from '@/components/ui/ChessButton';
import { useAuthProfile } from '@/hooks/use-auth-profile';

export default function HomeScreen() {
  const { profile, isSigningOut, signOut } = useAuthProfile();

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
      <YStack flex={1} p="$4" gap="$3" paddingTop={120}>
        <ProfileMenu
          name={profile.name}
          email={profile.email}
          isSigningOut={isSigningOut}
          onSignOut={handleSignOut}
        />

        <YStack gap={'$3'} width={'fit-content'} alignItems="center">
          <ChessButton variant="primary" size="lg">
            Jouer maintenant
          </ChessButton>
          <ChessButton variant="secondary" size="lg">
            Parametres du plateau
          </ChessButton>
        </YStack>
      </YStack>
    </View>
  );
}
