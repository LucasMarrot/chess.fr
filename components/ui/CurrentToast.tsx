import { Toast, useToastState } from '@tamagui/toast';
import { YStack } from 'tamagui';

export function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      viewportName={currentToast.viewportName}
      backgroundColor={currentToast.title.toLowerCase().includes('erreur') ? '$danger' : '$dark'}
      borderRadius="$4"
      padding="$3"
    >
      <YStack gap="$1">
        <Toast.Title color="$light" fontWeight="600" fontSize="$4">
          {currentToast.title}
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description color="$light" opacity={0.9} fontSize="$3">
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
}
