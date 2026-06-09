import React from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack, Avatar, Text, ScrollView, Separator, useTheme } from 'tamagui';
import { Edit2, UserPlus, Trophy, Swords, UserMinus, UserCheck, Clock } from 'lucide-react-native';
import { ChessButton } from '@/components/ui/ChessButton';
import type { UserProfile, Friendship } from '@/hooks/use-friends';

// Mocks statistiques (à remplacer plus tard par les vraies données de la BDD)
const MOCK_ELOS = [
  { category: 'Rapide', elo: 1200 },
  { category: 'Blitz', elo: 1050 },
  { category: 'Bullet', elo: 900 },
  { category: 'Daily', elo: 1300 },
];

const MOCK_HISTORY = [
  { id: '1', category: 'Rapide', opponent: 'Magnus', opponentElo: 2800, result: 'Défaite' },
  { id: '2', category: 'Blitz', opponent: 'Hikaru', opponentElo: 2750, result: 'Victoire' },
  { id: '3', category: 'Rapide', opponent: 'Garry', opponentElo: 2700, result: 'Victoire' },
];

type ProfileViewProps = {
  profile: UserProfile;
  isCurrentUser: boolean;
  acceptedFriends: Friendship[];
  // Actions pour "Mon Profil"
  onEdit?: () => void;
  onOpenFriends?: () => void;
  // Actions pour "Profil d'un autre joueur"
  friendStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  isRequester?: boolean; // Pour savoir si c'est nous qui avons envoyé la demande
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAcceptFriend?: () => void;
};

export function ProfileView({
  profile,
  isCurrentUser,
  acceptedFriends,
  onEdit,
  onOpenFriends,
  friendStatus,
  isRequester,
  onAddFriend,
  onRemoveFriend,
  onAcceptFriend,
}: ProfileViewProps) {
  const theme = useTheme();
  const router = useRouter();

  // --- Rendu conditionnel des boutons d'action ---
  const renderActionButtons = () => {
    if (isCurrentUser) {
      return (
        <XStack gap="$3" marginTop="$2">
          <ChessButton
            variant="secondary"
            size="sm"
            iconLeft={<Edit2 size={16} color={theme.dark?.val || 'black'} />}
            onPress={onEdit}
          >
            Éditer
          </ChessButton>
          <ChessButton
            variant="primary"
            size="sm"
            iconLeft={<UserPlus size={16} color="white" />}
            onPress={onOpenFriends}
          >
            Amis
          </ChessButton>
        </XStack>
      );
    }

    // Boutons pour un profil visiteur
    if (friendStatus === 'ACCEPTED') {
      return (
        <XStack gap="$3" marginTop="$2">
          <ChessButton
            variant="secondary"
            size="sm"
            iconLeft={<Swords size={16} color={theme.dark?.val || 'black'} />}
          >
            Défier
          </ChessButton>
          <ChessButton
            variant="destructive"
            size="sm"
            iconLeft={<UserMinus size={16} color="white" />}
            onPress={onRemoveFriend}
          >
            Retirer
          </ChessButton>
        </XStack>
      );
    }

    if (friendStatus === 'PENDING') {
      return isRequester ? (
        <XStack gap="$3" marginTop="$2">
          <ChessButton
            variant="secondary"
            size="sm"
            iconLeft={<Clock size={16} color={theme.dark?.val || 'black'} />}
            disabled
          >
            En attente
          </ChessButton>
        </XStack>
      ) : (
        <XStack gap="$3" marginTop="$2">
          <ChessButton
            variant="primary"
            size="sm"
            iconLeft={<UserCheck size={16} color="white" />}
            onPress={onAcceptFriend}
          >
            Accepter
          </ChessButton>
        </XStack>
      );
    }

    return (
      <XStack gap="$3" marginTop="$2">
        <ChessButton
          variant="primary"
          size="sm"
          iconLeft={<UserPlus size={16} color="white" />}
          onPress={onAddFriend}
        >
          Ajouter
        </ChessButton>
      </XStack>
    );
  };

  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      {/* EN-TÊTE PROFIL */}
      <YStack alignItems="center" paddingVertical="$6" gap="$3">
        <Avatar circular size="$12">
          <Avatar.Image src={profile.avatar_url || 'https://via.placeholder.com/150'} />
          <Avatar.Fallback backgroundColor="$gray5" />
        </Avatar>

        <YStack alignItems="center">
          <Text fontSize="$9" fontWeight="800" letterSpacing={-0.5}>
            {profile.username}
          </Text>
          <Text fontSize="$4" color="$gray10">
            @{profile.id.split('-')[0]}
          </Text>
        </YStack>

        {renderActionButtons()}
      </YStack>

      <Separator borderColor="$gray5" />

      {/* STATISTIQUES */}
      <YStack padding="$4" gap="$3">
        <XStack alignItems="center" gap="$2" marginBottom="$2">
          <Trophy size={20} color={theme.dark?.val || 'black'} />
          <Text fontSize="$6" fontWeight="bold">
            Classements
          </Text>
        </XStack>
        <XStack flexWrap="wrap" gap="$3">
          {MOCK_ELOS.map((stat) => (
            <YStack
              key={stat.category}
              flex={1}
              minWidth="45%"
              backgroundColor="$gray2"
              padding="$3"
              borderRadius="$4"
              alignItems="center"
              borderWidth={1}
              borderColor="$gray4"
            >
              <Text color="$gray11" fontSize="$3">
                {stat.category}
              </Text>
              <Text fontWeight="bold" fontSize="$7" marginTop="$1">
                {stat.elo}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>

      {/* HISTORIQUE */}
      <YStack padding="$4" gap="$3">
        <XStack alignItems="center" gap="$2" marginBottom="$2">
          <Swords size={20} color={theme.dark?.val || 'black'} />
          <Text fontSize="$6" fontWeight="bold">
            Historique
          </Text>
        </XStack>
        <YStack gap="$2">
          {MOCK_HISTORY.map((match) => (
            <XStack
              key={match.id}
              backgroundColor="$gray2"
              padding="$3"
              borderRadius="$3"
              justifyContent="space-between"
              alignItems="center"
            >
              <YStack>
                <Text fontWeight="600">{match.category}</Text>
                <Text fontSize="$2" color="$gray10">
                  vs {match.opponent} ({match.opponentElo})
                </Text>
              </YStack>
              <Text fontWeight="bold" color={match.result === 'Victoire' ? '$green10' : '$red10'}>
                {match.result}
              </Text>
            </XStack>
          ))}
        </YStack>
      </YStack>

      {/* LISTE DES AMIS */}
      <YStack padding="$4" gap="$3" paddingBottom="$10">
        <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
          {isCurrentUser
            ? `Mes Amis (${acceptedFriends.length})`
            : `Amis (${acceptedFriends.length})`}
        </Text>
        {acceptedFriends.map((friend) => {
          // Gère le cas où on consulte le profil d'un ami (le profil lié n'est pas le même)
          const p = friend.friend_profile;
          if (!p) return null;

          return (
            <XStack
              key={friend.id}
              alignItems="center"
              gap="$3"
              padding="$2"
              backgroundColor="$gray2"
              borderRadius="$3"
            >
              <Avatar circular size="$4">
                <Avatar.Image src={p.avatar_url || ''} />
                <Avatar.Fallback backgroundColor="$gray5" />
              </Avatar>
              <YStack flex={1}>
                <Text fontWeight="bold">{p.username}</Text>
              </YStack>
              {!isCurrentUser && p.id === profile.id ? null : ( // On ne met pas de bouton sur soi-même
                <ChessButton
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push(`/profile/${p.id}`)}
                >
                  Profil
                </ChessButton>
              )}
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
