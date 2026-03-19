import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { Button, Text, View, YStack } from 'tamagui';

import { Avatar } from '@/components/avatar';
import { PrimaryButton, SecondaryButton } from '@/components/ui/ChessButton';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const profileAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const resolveName = (metadata: Record<string, unknown> | undefined) => {
      const fullName = metadata?.full_name as string | undefined;
      const name = metadata?.name as string | undefined;

      return (fullName || name || '').trim();
    };

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUserEmail(data.user?.email ?? '');
      setUserName(resolveName(data.user?.user_metadata));
    }

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? '');
      setUserName(resolveName(session?.user?.user_metadata));
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    Animated.timing(profileAnim, {
      toValue: showProfile ? 1 : 0,
      duration: showProfile ? 240 : 140,
      easing: showProfile ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [profileAnim, showProfile]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    Alert.alert('Deconnecte', 'Vous etes deconnecte.');
  }

  return (
    <View flex={1} backgroundColor="$background">
      <YStack p="$4" gap="$3" paddingTop={120}>
        <View style={styles.profileWrapper}>
          <View
            style={styles.avatarButton}
            backgroundColor="$background"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowProfile((value) => !value)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <Avatar seed={userName || 'Utilisateur'} size={48} />
            </Pressable>
          </View>

          <Animated.View
            pointerEvents={showProfile ? 'auto' : 'none'}
            style={[
              styles.profileCard,
              {
                opacity: profileAnim,
                transform: [
                  {
                    translateY: profileAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-48, 0],
                    }),
                  },
                  {
                    scale: profileAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <YStack
              backgroundColor="$background"
              borderColor="$borderColor"
              borderWidth={1}
              br="$5"
              p="$4"
              gap="$2"
              alignItems="center"
              elevation={6}
              shadowOpacity={0.18}
              shadowRadius={14}
              shadowOffset={{ width: 0, height: 8 }}
            >
              <Avatar seed={userName || 'Utilisateur'} size={72} />
              <Text fontFamily="$heading" fontSize="$6" fontWeight="700" letterSpacing={0.4}>
                {userName || 'Nom non defini'}
              </Text>
              <Text fontSize="$3" opacity={0.7}>
                {userEmail || 'Non connecte'}
              </Text>
              <Button
                size="$3"
                theme="Secondary"
                borderColor="$primary"
                backgroundColor="$backgroundTransparent"
                br="$6"
                onPress={handleSignOut}
              >
                <Text
                  fontFamily="$heading"
                  letterSpacing={0.8}
                  textTransform="uppercase"
                  color="$primary"
                >
                  Sign out
                </Text>
              </Button>
            </YStack>
          </Animated.View>
        </View>

        <PrimaryButton size="$5">Jouer maintenant</PrimaryButton>
        <SecondaryButton size="$4">Parametres du plateau</SecondaryButton>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
    alignItems: 'flex-end',
  },
  avatarButton: {
    borderRadius: 999,
    padding: 2,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  profileCard: {
    position: 'absolute',
    top: 64,
    right: 0,
    zIndex: 10,
    width: 220,
  },
});
