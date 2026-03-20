import { Text, YStack } from 'tamagui';
import { Avatar } from '@/components/avatar';
import { ChessButton } from '@/components/ui/ChessButton';
import { PROFILE_UI } from '@/constants/profile-ui';

type ProfileMenuCardProps = {
  name: string;
  email: string;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function ProfileMenuCard({ name, email, isSigningOut, onSignOut }: ProfileMenuCardProps) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      br="$5"
      p="$4"
      gap="$2"
      alignItems="center"
      elevation={PROFILE_UI.card.elevation}
      shadowOpacity={PROFILE_UI.card.shadowOpacity}
      shadowRadius={PROFILE_UI.card.shadowRadius}
      shadowOffset={{ width: 0, height: PROFILE_UI.card.shadowOffsetY }}
    >
      <Avatar seed={name || PROFILE_UI.labels.fallbackName} size={PROFILE_UI.card.avatarSize} />
      <Text fontFamily="$heading" fontSize="$6" fontWeight="700" letterSpacing={0.4}>
        {name || PROFILE_UI.labels.undefinedName}
      </Text>
      <Text fontSize="$3" opacity={0.7}>
        {email || PROFILE_UI.labels.disconnected}
      </Text>
      <ChessButton
        variant="secondary"
        size="sm"
        fullWidth
        loading={isSigningOut}
        onPress={onSignOut}
      >
        {PROFILE_UI.labels.signOut}
      </ChessButton>
    </YStack>
  );
}
