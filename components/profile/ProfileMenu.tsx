import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { ProfileAvatarButton } from '@/components/profile/ProfileAvatarButton';
import { ProfileMenuCard } from '@/components/profile/ProfileMenuCard';
import { PROFILE_UI } from '@/constants/profile-ui';

type ProfileMenuProps = {
  name: string;
  email: string;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function ProfileMenu({ name, email, isSigningOut, onSignOut }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const profileAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(profileAnim, {
      toValue: isOpen ? 1 : 0,
      duration: isOpen ? PROFILE_UI.menu.openDurationMs : PROFILE_UI.menu.closeDurationMs,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOpen, profileAnim]);

  return (
    <View style={styles.root} pointerEvents="box-none">
      {isOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={PROFILE_UI.labels.closeMenu}
          onPress={() => setIsOpen(false)}
          style={styles.backdrop}
        />
      ) : null}

      <View style={styles.profileWrapper}>
        <ProfileAvatarButton
          seed={name || PROFILE_UI.labels.fallbackName}
          isExpanded={isOpen}
          onPress={() => setIsOpen((value) => !value)}
        />

        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.profileCard,
            {
              opacity: profileAnim,
              transform: [
                {
                  translateY: profileAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PROFILE_UI.menu.hiddenTranslateY, 0],
                  }),
                },
                {
                  scale: profileAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PROFILE_UI.menu.hiddenScale, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ProfileMenuCard
            name={name}
            email={email}
            isSigningOut={isSigningOut}
            onSignOut={onSignOut}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  profileWrapper: {
    position: 'absolute',
    top: PROFILE_UI.menu.wrapperTop,
    right: PROFILE_UI.menu.wrapperRight,
    zIndex: 20,
    alignItems: 'flex-end',
  },
  profileCard: {
    position: 'absolute',
    top: PROFILE_UI.menu.cardTop,
    right: 0,
    zIndex: 10,
    width: PROFILE_UI.menu.cardWidth,
  },
});
