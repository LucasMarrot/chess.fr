import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, YStack, XStack, Input, Text, Separator } from 'tamagui';
import { ChessButton } from '@/components/ui/ChessButton';
import { AppHeader } from '@/components/headers/AppHeader';
import { decodeGameCode } from '@/lib/online-chess';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handlePlayOnline = () => {
    router.push({
      pathname: '/local-game/config',
      params: {
        mode: 'online',
      },
    });
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim() || isJoining) return;
    setIsJoining(true);

    // 1. On extrait les 6 lettres
    const { roomId } = decodeGameCode(joinCode);

    // 2. On va chercher les paramètres cachés dans Supabase
    const { data, error } = await supabase.from('game_rooms').select('*').eq('id', roomId).single();

    setIsJoining(false);

    if (error || !data) {
      Alert.alert('Erreur', 'Code invalide ou partie introuvable !');
      return;
    }

    // 3. On donne à l'invité la couleur opposée
    const guestColor = data.host_color === 'white' ? 'black' : 'white';

    // 4. On lance la partie exactement comme la vieille version qui marchait !
    router.push({
      pathname: '/local-game/play',
      params: {
        mode: 'online',
        roomId: data.id,
        timeControl: data.time_control,
        color: guestColor,
      },
    });
  };

  return (
    <>
      <AppHeader />
      <View
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        p="$4"
      >
        <YStack width="100%" maxWidth={360} alignItems="center" gap="$4">
          <ChessButton variant="primary" size="lg" fullWidth onPress={handlePlayOnline}>
            Créer une partie en ligne
          </ChessButton>

          {/* --- NOUVELLE SECTION: REJOINDRE --- */}
          <YStack width="100%" gap="$3" marginVertical="$2" alignItems="center">
            <Text color="$gray10" fontSize="$2" fontWeight="700" letterSpacing={1}>
              OU REJOINDRE
            </Text>
            <XStack gap="$2" width="100%">
              <Input
                flex={1}
                size="$4"
                placeholder="Entrer un Code ou Lien..."
                placeholderTextColor="black"
                value={joinCode}
                onChangeText={setJoinCode}
                borderWidth={1}
                borderColor="$gray5"
                borderRadius="$4"
                backgroundColor="$background"
              />
              <ChessButton
                variant="primary"
                onPress={handleJoinGame}
                disabled={!joinCode.trim() || isJoining}
              >
                {isJoining ? '...' : 'OK'}
              </ChessButton>
            </XStack>
          </YStack>

          <Separator width="80%" borderColor="$gray5" />

          <ChessButton
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => router.push('/local-game/config')}
          >
            Jouer en local
          </ChessButton>
        </YStack>
      </View>
    </>
  );
}
