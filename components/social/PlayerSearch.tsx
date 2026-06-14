import React, { useState, useEffect } from 'react';
import { XStack, YStack, Input, Text, Avatar, Spinner, View } from 'tamagui';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { type UserProfile } from '../../hooks/use-friends';
import { AvatarImage } from '../ui/AvatarImage';

export const PlayerSearch = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, elo')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <YStack gap="$3" width="100%">
      <XStack gap="$2" width="100%" alignItems="center">
        {/* Conteneur de l'Input pour gérer l'icône X en position absolue */}
        <View flex={1} position="relative" justifyContent="center">
          <Input
            size="$4"
            placeholder="Rechercher un pseudo..."
            placeholderTextColor="black" // <-- Placeholder noir comme demandé
            value={query}
            onChangeText={setQuery}
            borderWidth={1}
            borderColor="$gray5"
            borderRadius="$4"
            backgroundColor="$background"
            paddingRight={query.length > 0 ? 40 : 12} // Laisse de la place pour la croix
          />

          {/* Icône pour vider la recherche */}
          {query.length > 0 && (
            <View
              position="absolute"
              right={10}
              zIndex={10}
              onPress={() => setQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Rend la croix plus facile à cliquer
            >
              <X size={18} color="black" />
            </View>
          )}
        </View>
      </XStack>

      {isSearching ? (
        <Spinner size="small" color="$blue10Light" marginTop="$4" />
      ) : (
        <YStack gap="$2" marginTop="$2">
          {results.map((user) => (
            <XStack
              key={user.id}
              padding="$3"
              backgroundColor="$gray2"
              borderRadius="$4"
              alignItems="center"
              gap="$3"
              pressStyle={{ opacity: 0.7, scale: 0.98 }}
              onPress={() => router.push(`/profile/${user.id}`)}
            >
              <Avatar circular size="$4">
                <AvatarImage
                  src={user.avatar_url || 'https://via.placeholder.com/150'}
                  accessibilityLabel={`Avatar de ${user.username}`}
                />
                <Avatar.Fallback backgroundColor="$gray5" />
              </Avatar>
              <YStack flex={1}>
                <Text fontWeight="600" fontSize="$4">
                  {user.username}
                </Text>
                <Text color="$gray10" fontSize="$2">
                  Elo: {user.elo}
                </Text>
              </YStack>
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
};
