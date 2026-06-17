import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { YStack, Text, Spinner, useTheme } from 'tamagui';
import { supabase } from '@/lib/supabase';
import { useAuthProfile } from '@/hooks/use-auth-profile';
import { useFriends, type UserProfile } from '@/hooks/use-friends';
import { ProfileView } from '@/components/profile/ProfileView';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { profile: currentUser } = useAuthProfile();
  const { friends, sendFriendRequest, respondToRequest, removeFriend } = useFriends(
    currentUser?.id,
  );

  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, elo')
        .eq('id', id)
        .single();

      if (data) setTargetProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

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

  // Vérifie si vous avez déjà un lien avec ce joueur
  const currentFriendship = friends.find(
    (f) =>
      (f.requester_id === currentUser?.id && f.addressee_id === id) ||
      (f.requester_id === id && f.addressee_id === currentUser?.id),
  );

  const isRequester = currentFriendship?.requester_id === currentUser?.id;
  const friendStatus = currentFriendship ? currentFriendship.status : 'NONE';

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Le composant générique affiche les boutons sociaux selon votre statut */}
      <ProfileView
        profile={targetProfile}
        isCurrentUser={false}
        acceptedFriends={[]} // Par défaut vide pour les autres joueurs (à implémenter plus tard si besoin)
        friendStatus={friendStatus}
        isRequester={isRequester}
        onAddFriend={() => currentUser?.id && id && sendFriendRequest(id)}
        onRemoveFriend={() => currentFriendship && removeFriend(currentFriendship.id)}
        onAcceptFriend={() =>
          currentFriendship && respondToRequest(currentFriendship.id, 'ACCEPTED')
        }
      />
    </YStack>
  );
}
