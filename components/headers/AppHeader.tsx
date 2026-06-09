import { ReactNode, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, View } from 'tamagui';
import { useRouter } from 'expo-router';

import { PROFILE_UI } from '@/constants/profile-ui';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { ProfileAvatarButton } from '../profile/ProfileAvatarButton';
import { FriendsButton } from '../social/FriendsButton';
import { FriendsSheet } from '../social/FriendsSheet';

type AppHeaderProps = {
  centerContent?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode; // <-- Ajout de la prop
  showBorder?: boolean;
};

export function AppHeader({
  centerContent,
  leftContent,
  rightContent,
  showBorder = true,
}: AppHeaderProps) {
  const { profile } = useAuthProfile();
  const router = useRouter();
  const [isFriendsSheetOpen, setIsFriendsSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const horizontalPadding = 12;
  const verticalPadding = 8;

  const profileButtonWidth = PROFILE_UI.avatarButton.size + PROFILE_UI.avatarButton.padding * 2 + 2;
  const friendsButtonWidth = 40;
  const rightSideDefaultWidth = profileButtonWidth + friendsButtonWidth + 12;

  // On s'assure que les deux fentes sont égales pour un centrage parfait
  const sideSlotWidth = Math.max(profileButtonWidth, rightSideDefaultWidth);

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
          {rightContent !== undefined ? (
            rightContent
          ) : profile.isAuthenticated && profile.id ? (
            <XStack alignItems="center" gap="$3">
              <FriendsButton onPress={() => setIsFriendsSheetOpen(true)} />

              <FriendsSheet
                open={isFriendsSheetOpen}
                onOpenChange={setIsFriendsSheetOpen}
                currentUserId={profile.id}
              />
            </XStack>
          ) : null}
        </View>
      </XStack>
    </View>
  );
}
