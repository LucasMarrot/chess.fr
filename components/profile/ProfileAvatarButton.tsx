import { Pressable, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { Avatar } from '@/components/avatar';
import { BUTTON_FEEDBACK } from '@/constants/button-feedback';
import { PROFILE_UI } from '@/constants/profile-ui';
import { CheckerboardPressFeedback } from '@/components/ui/CheckerboardPressFeedback';
import { useState } from 'react';

type ProfileAvatarButtonProps = {
  seed: string;
  onPress: () => void;
  isExpanded: boolean;
};

export function ProfileAvatarButton({ seed, onPress, isExpanded }: ProfileAvatarButtonProps) {
  const [feedbackSignal, setFeedbackSignal] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View
      style={[styles.avatarButton, isPressed && styles.avatarButtonPressed]}
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={PROFILE_UI.labels.openMenu}
        accessibilityState={{ expanded: isExpanded }}
        onPress={onPress}
        onPressIn={() => {
          setIsPressed(true);
          setFeedbackSignal((value) => value + 1);
        }}
        onPressOut={() => setIsPressed(false)}
        style={styles.pressable}
      >
        <Avatar seed={seed} size={PROFILE_UI.avatarButton.size} />
        <CheckerboardPressFeedback
          playSignal={feedbackSignal}
          lightTokenKey={BUTTON_FEEDBACK.checkerTokens.lightSurface.light}
          darkTokenKey={BUTTON_FEEDBACK.checkerTokens.lightSurface.dark}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    borderRadius: PROFILE_UI.avatarButton.borderRadius,
    padding: PROFILE_UI.avatarButton.padding,
    shadowOpacity: PROFILE_UI.avatarButton.shadowOpacity,
    shadowRadius: PROFILE_UI.avatarButton.shadowRadius,
    shadowOffset: { width: 0, height: PROFILE_UI.avatarButton.shadowOffsetY },
    elevation: PROFILE_UI.avatarButton.elevation,
    transform: [{ scale: 1 }],
  },
  avatarButtonPressed: {
    transform: [{ scale: PROFILE_UI.avatarButton.pressScale }],
  },
  pressable: {
    position: 'relative',
    cursor: BUTTON_FEEDBACK.cursorPointer,
    overflow: 'hidden',
    borderRadius: PROFILE_UI.avatarButton.borderRadius,
  },
});
