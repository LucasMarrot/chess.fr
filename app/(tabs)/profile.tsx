import { Text, View, YStack } from 'tamagui';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useAuthProfile } from '@/hooks/use-auth-profile';

const RATING_ROWS = [
  { key: 'bullet', label: 'Bullet' },
  { key: 'blitz', label: 'Blitz' },
  { key: 'rapid', label: 'Rapide' },
] as const;

export default function ProfileScreen() {
  const isFocused = useIsFocused();
  const { profile, refresh } = useAuthProfile();
  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      void refresh();
    }

    Animated.timing(screenAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.back(0.9)),
      delay: 40,
      useNativeDriver: true,
    }).start();
  }, [isFocused, refresh, screenAnim]);

  return (
    <View flex={1} backgroundColor="$background">
      <Animated.View
        style={{
          flex: 1,
          opacity: screenAnim,
          transform: [
            {
              translateY: screenAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [60, 0],
              }),
            },
            {
              scale: screenAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        }}
      >
        <YStack flex={1} alignItems="center" justifyContent="center" p="$4" gap="$4">
          <Text fontFamily="$heading" fontSize="$8" fontWeight="700">
            Profil
          </Text>
          <YStack width="100%" maxWidth={360} gap="$3">
            {RATING_ROWS.map((row) => (
              <YStack
                key={row.key}
                backgroundColor="$light"
                borderColor="$buttonSecondaryBorder"
                borderWidth={1}
                borderRadius={12}
                padding="$4"
                gap="$1"
              >
                <Text color="$interactionGrey" fontSize="$3" fontWeight="700">
                  {row.label}
                </Text>
                <Text color="$dark" fontSize="$8" fontWeight="800">
                  {profile.elo[row.key]}
                </Text>
              </YStack>
            ))}
          </YStack>
        </YStack>
      </Animated.View>
    </View>
  );
}
