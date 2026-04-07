import { Text, styled } from 'tamagui';

const SECTION_LABEL_SPACING = 1;

export const ConfigSectionLabel = styled(Text, {
  color: '$interactionGrey',
  fontSize: '$4',
  fontWeight: '400',
  letterSpacing: SECTION_LABEL_SPACING,
});
