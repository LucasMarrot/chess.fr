import { Button, styled } from 'tamagui';

// Bouton de base pour le jeu (partage les propriétés communes)
export const ChessButton = styled(Button, {
  borderRadius: '$4',
  borderStyle: 'solid',
  borderWidth: 2,
  overflow: 'hidden',

  pressStyle: {
    scale: 0.97,
    opacity: 0.95,
  },

  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
});

// Bouton Primaire (ex: "Nouvelle Partie")
export const PrimaryButton = styled(ChessButton, {
  theme: 'Primary',
});

// Bouton Secondaire (ex: "Options" ou "Analyse")
export const SecondaryButton = styled(ChessButton, {
  theme: 'Secondary',
});
