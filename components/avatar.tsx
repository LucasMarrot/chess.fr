import { useMemo } from 'react';
import { View } from 'react-native';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';
import { getTokens } from 'tamagui';

type AvatarProps = {
  seed: string;
  size?: number;
};

export function Avatar({ seed, size = 64 }: AvatarProps) {
  const tokens = getTokens();
  const backgroundColor = tokens.color.light.val;

  const avatarXml = useMemo(() => {
    return createAvatar(lorelei, {
      seed: seed.trim() || 'User',
      size: Math.round(size * 2),
      beardProbability: 80,
      earringsProbability: 0,
      hairAccessoriesProbability: 0,
    }).toString();
  }, [seed, size]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor,
      }}
    >
      <SvgXml
        accessibilityLabel={`Avatar for ${seed}`}
        xml={avatarXml}
        width={size}
        height={size}
      />
    </View>
  );
}
