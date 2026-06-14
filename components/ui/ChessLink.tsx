import React from 'react';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { Text, styled, type GetProps } from 'tamagui';

const StyledLinkText = styled(Text, {
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '600',
  color: '$dark',
  textDecorationLine: 'underline',
  cursor: 'pointer',

  hoverStyle: {
    color: '$interactionGrey',
  },

  pressStyle: {
    opacity: 0.6,
  },
});

type StyledLinkTextProps = GetProps<typeof StyledLinkText>;

// 2. On utilise simplement Href sans les chevrons <string | object>
// Expo Router va automatiquement injecter les bonnes routes (ex: "/login", "/register")
export interface ChessLinkProps extends Omit<StyledLinkTextProps, 'href'> {
  href: Href;
  children: React.ReactNode;
  replace?: boolean;
}

export function ChessLink({ href, children, replace, ...props }: ChessLinkProps) {
  return (
    <Link href={href} replace={replace} asChild>
      <StyledLinkText {...props}>{children}</StyledLinkText>
    </Link>
  );
}
