import { ChessButton } from '@/components/ui/ChessButton';

import { LocalGameModal } from './LocalGameModal';
import type { LocalGameTheme } from './types';

type LocalGameDrawConfirmOverlayProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  theme: LocalGameTheme;
};

export const LocalGameDrawConfirmOverlay = ({
  visible,
  onCancel,
  onConfirm,
  theme,
}: LocalGameDrawConfirmOverlayProps) => {
  return (
    <LocalGameModal
      visible={visible}
      title="Confirmer la nulle ?"
      description="Voulez-vous vraiment declarer la partie nulle ?"
      onRequestClose={onCancel}
      theme={theme}
      actions={
        <>
          <ChessButton variant="secondary" size="md" onPress={onCancel}>
            Annuler
          </ChessButton>
          <ChessButton variant="primary" size="md" onPress={onConfirm}>
            Confirmer
          </ChessButton>
        </>
      }
    />
  );
};
