import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { localGameStyles } from './styles';
import type { LocalGameTheme } from './types';

type LocalGameModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  theme: LocalGameTheme;
  onRequestClose?: () => void;
  children?: ReactNode;
  actions?: ReactNode;
};

export const LocalGameModal = ({
  visible,
  title,
  description,
  theme,
  onRequestClose,
  children,
  actions,
}: LocalGameModalProps) => {
  if (!visible) return null;

  return (
    <Pressable
      style={[localGameStyles.modalBackdrop, { backgroundColor: theme.endOverlayBackdrop }]}
      onPress={onRequestClose}
    >
      <Pressable onPress={() => {}}>
        <YStack
          backgroundColor={theme.light}
          borderColor={theme.buttonPrimaryBorder}
          width="100%"
          maxWidth={430}
          borderRadius={20}
          borderWidth={1}
          paddingHorizontal={15}
          paddingTop={15}
          paddingBottom={15}
          gap="$4"
        >
          <YStack gap="$3" paddingHorizontal={15}>
            <Text color={theme.dark} fontSize="$6" fontWeight="700">
              {title}
            </Text>

            {description ? (
              <Text color={theme.interactionGrey} fontSize="$4">
                {description}
              </Text>
            ) : null}
          </YStack>

          {children ? (
            <YStack gap="$3" paddingHorizontal={15}>
              {children}
            </YStack>
          ) : null}

          {actions ? (
            <XStack style={localGameStyles.modalActionsRow} paddingHorizontal={15}>
              {actions}
            </XStack>
          ) : null}
        </YStack>
      </Pressable>
    </Pressable>
  );
};
