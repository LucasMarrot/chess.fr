import { ChessButton } from '@/components/ui/ChessButton';

import { LocalGameModal } from './LocalGameModal';
import type { LocalGameTheme } from './types';

type LocalGameExitConfirmOverlayProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  theme: LocalGameTheme;
};

export const LocalGameExitConfirmOverlay = ({
  visible,
  onCancel,
  onConfirm,
  theme,
}: LocalGameExitConfirmOverlayProps) => {
  return (
    <LocalGameModal
      visible={visible}
      title="Quitter la partie ?"
      description="La partie en cours sera abandonnee."
      onRequestClose={onCancel}
      theme={theme}
      actions={
        <>
          <ChessButton variant="secondary" size="md" flex={1} onPress={onCancel}>
            Annuler
          </ChessButton>
          <ChessButton variant="primary" size="md" flex={1} onPress={onConfirm}>
            Quitter
          </ChessButton>
        </>
      }
    />
  );
};
