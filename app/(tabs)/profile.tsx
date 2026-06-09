import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Text, Spinner } from 'tamagui';
import { LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useFriends, type UserProfile } from '@/hooks/use-friends';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { ChessButton } from '@/components/ui/ChessButton';
import { FriendsSheet } from '@/components/social/FriendsSheet';
import { AppHeader } from '@/components/headers/AppHeader';
import { ProfileView } from '@/components/profile/ProfileView';

export default function MyProfileTab() {
  const router = useRouter();
  const { profile: currentUser, signOut } = useAuthProfile();
  const { friends } = useFriends(currentUser?.id);

  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFriendsSheetOpen, setIsFriendsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, elo')
        .eq('id', currentUser.id)
        .single();

      if (data) setTargetProfile(data);
      setLoading(false);
    };
    fetchMyProfile();
  }, [currentUser?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading)
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" />
      </YStack>
    );
  if (!targetProfile)
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text>Utilisateur introuvable.</Text>
      </YStack>
    );

  const acceptedFriends = friends.filter((f) => f.status === 'ACCEPTED');

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader
        showBorder={false}
        centerContent={
          <Text fontSize="$5" fontWeight="bold">
            Mon Profil
          </Text>
        }
        rightContent={
          <ChessButton
            variant="destructive"
            size="icon"
            shape="circle"
            onPress={handleSignOut}
            iconLeft={<LogOut size={20} color="white" />}
          />
        }
      />

      <ProfileView
        profile={targetProfile}
        isCurrentUser={true}
        acceptedFriends={acceptedFriends}
        onEdit={() => console.log('Éditer le profil')}
        onOpenFriends={() => setIsFriendsSheetOpen(true)}
      />

      {currentUser?.id && (
        <FriendsSheet
          open={isFriendsSheetOpen}
          onOpenChange={setIsFriendsSheetOpen}
          currentUserId={currentUser.id}
        />
      )}
    </YStack>
  );
}
