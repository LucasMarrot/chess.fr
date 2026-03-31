import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, View } from 'tamagui';

import { PROFILE_UI } from '@/constants/profile-ui';
import { ProfileMenu } from '../profile/ProfileMenu';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { Alert } from 'react-native';

type AppHeaderProps = {
  centerContent?: ReactNode;
  leftContent?: ReactNode;
  showBorder?: boolean;
};

export function AppHeader({ centerContent, leftContent, showBorder = true }: AppHeaderProps) {
  const { profile, isSigningOut, signOut } = useAuthProfile();

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    Alert.alert('Deconnecte', 'Vous etes deconnecte.');
  }

  const insets = useSafeAreaInsets();

  const paddingHorizontal = 12;
  const paddingVertical = 8;
  const avatarSize = PROFILE_UI.avatarButton.size;

  return (
    <View
      borderBottomWidth={showBorder ? 1 : 0}
      borderBottomColor={showBorder ? '$borderColor' : undefined}
      backgroundColor="$background"
      paddingTop={insets.top}
      padding={paddingVertical}
    >
      <XStack
        height={avatarSize + paddingVertical * 2}
        paddingHorizontal={paddingHorizontal}
        paddingVertical={paddingVertical}
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
      >
        {leftContent && <View>{leftContent}</View>}

        <View flex={1}>{centerContent}</View>

        <ProfileMenu
          name={profile.name}
          email={profile.email}
          isSigningOut={isSigningOut}
          onSignOut={handleSignOut}
        />
      </XStack>
    </View>
  );
}
