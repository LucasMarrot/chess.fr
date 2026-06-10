import { ChessButton } from '@/components/ui/ChessButton';

import { LocalGameModal } from './LocalGameModal';
import type { LocalGameTheme } from './types';

type LocalGameDrawConfirmOverlayProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  theme: LocalGameTheme;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const LocalGameDrawConfirmOverlay = ({
  visible,
  onCancel,
  onConfirm,
  theme,
  title = 'Confirmer la nulle ?',
  description = 'Voulez-vous vraiment declarer la partie nulle ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
}: LocalGameDrawConfirmOverlayProps) => {
  return (
    <LocalGameModal
      visible={visible}
      title={title}
      description={description}
      onRequestClose={onCancel}
      theme={theme}
      actions={
        <>
          <ChessButton variant="secondary" size="md" flex={1} onPress={onCancel}>
            {cancelLabel}
          </ChessButton>
          <ChessButton variant="primary" size="md" flex={1} onPress={onConfirm}>
            {confirmLabel}
          </ChessButton>
        </>
      }
    />
  );
};
