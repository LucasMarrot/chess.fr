import { Text, View, YStack } from 'tamagui';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const isFocused = useIsFocused();
  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.back(0.9)),
      delay: 40,
      useNativeDriver: true,
    }).start();
  }, [isFocused, screenAnim]);

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
        <YStack flex={1} alignItems="center" justifyContent="center" p="$4" gap="$2">
          <Text fontFamily="$heading" fontSize="$8" fontWeight="700">
            Profil
          </Text>
          <Text fontSize="$4" opacity={0.7} textAlign="center">
            Page profil en construction.
          </Text>
        </YStack>
      </Animated.View>
    </View>
  );
}
