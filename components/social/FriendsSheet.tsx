import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { Sheet, YStack, XStack, Text, Avatar, Circle, ScrollView, Separator } from 'tamagui';
import { useFriends } from '../../hooks/use-friends';
import { useRouter } from 'expo-router';
import { ChessButton } from '../ui/ChessButton';
import { AvatarImage } from '../ui/AvatarImage';
import { PlayerSearch } from './PlayerSearch';

type FriendsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
};

export const FriendsSheet = ({ open, onOpenChange, currentUserId }: FriendsSheetProps) => {
  const { friends, onlineUsers } = useFriends(currentUserId);
  const router = useRouter();

  // État local pour garder le Modal natif ouvert le temps de l'animation de fermeture
  const [isModalVisible, setIsModalVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsModalVisible(true);
    } else {
      // On attend 300ms avant de démonter le modal pour laisser le temps
      // au Sheet de glisser vers le bas avec fluidité
      const timer = setTimeout(() => setIsModalVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const acceptedFriends = friends.filter((f) => f.status === 'ACCEPTED');

  // Si le modal est totalement fermé, on ne rend rien pour économiser de la mémoire
  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="none" // Tamagui gère déjà l'animation de glissement
      onRequestClose={() => onOpenChange(false)} // Ferme sur le bouton "Retour" d'Android
    >
      <Sheet
        modal={false}
        zIndex={100000}
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[85, 50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={() => onOpenChange(false)} // Ferme en cliquant dans le vide
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4">
          <YStack gap="$4" flex={1}>
            <Text fontSize="$6" fontWeight="bold">
              Espace Social
            </Text>

            <PlayerSearch />

            <Separator marginVertical="$2" borderColor="$gray5" />

            <Text fontSize="$5" fontWeight="600">
              Mes Amis ({acceptedFriends.length})
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} flex={1}>
              <YStack gap="$3" paddingBottom="$5">
                {acceptedFriends.length === 0 ? (
                  <Text color="$gray10" textAlign="center" marginTop="$4">
                    Aucun ami pour le moment.
                  </Text>
                ) : (
                  acceptedFriends.map((friend) => {
                    const profile = friend.friend_profile;
                    if (!profile) return null;
                    const isOnline = onlineUsers[profile.id];

                    return (
                      <XStack
                        key={friend.id}
                        alignItems="center"
                        gap="$3"
                        padding="$2"
                        backgroundColor="transparent"
                        borderRadius="$3"
                      >
                        <XStack>
                          <Avatar circular size="$5">
                            <AvatarImage
                              src={profile.avatar_url || 'https://via.placeholder.com/150'}
                              accessibilityLabel={`Avatar de ${profile.username}`}
                            />
                            <Avatar.Fallback backgroundColor="$gray5" />
                          </Avatar>
                          <Circle
                            size="$1.5"
                            backgroundColor={isOnline ? '$green10' : '$gray8'}
                            position="absolute"
                            bottom={-2}
                            right={-2}
                            borderWidth={2}
                            borderColor="$background"
                          />
                        </XStack>

                        <YStack flex={1}>
                          <Text fontWeight="600" fontSize="$4">
                            {profile.username}
                          </Text>
                          <Text color="$gray10" fontSize="$2">
                            Elo: {profile.elo}
                          </Text>
                        </YStack>

                        <ChessButton
                          variant="secondary"
                          size="sm"
                          onPress={() => {
                            onOpenChange(false);
                            router.push(`/profile/${profile.id}`);
                          }}
                        >
                          Voir
                        </ChessButton>
                      </XStack>
                    );
                  })
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </Modal>
  );
};
