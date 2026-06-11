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
  const horizontalPadding = 12;
  const verticalPadding = 8;
  const profileButtonWidth = PROFILE_UI.avatarButton.size + PROFILE_UI.avatarButton.padding * 2 + 2;
  const sideSlotWidth = profileButtonWidth;
  const shouldCenterProfile = !centerContent && !leftContent;

  const profileMenu = (
    <ProfileMenu
      name={profile.name}
      email={profile.email}
      isSigningOut={isSigningOut}
      onSignOut={handleSignOut}
    />
  );

  return (
    <View
      borderBottomWidth={showBorder ? 1 : 0}
      borderBottomColor={showBorder ? '$borderColor' : undefined}
      backgroundColor="$background"
      paddingTop={insets.top}
    >
      <XStack
        minHeight={PROFILE_UI.avatarButton.size + verticalPadding * 2}
        paddingHorizontal={horizontalPadding}
        paddingVertical={verticalPadding}
        alignItems="center"
        gap="$3"
      >
        <View width={sideSlotWidth} alignItems="flex-start" justifyContent="center">
          {leftContent}
        </View>

        <View flex={1} alignItems="center" justifyContent="center">
          {centerContent}
        </View>

        <View width={sideSlotWidth} alignItems="flex-end" justifyContent="center">
          {profileMenu}
        </View>
      </XStack>
    </View>
  );
}
