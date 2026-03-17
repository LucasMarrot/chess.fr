import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';

type AvatarProps = {
  seed: string;
  size?: number;
};

export function Avatar({ seed, size = 64 }: AvatarProps) {
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
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <SvgXml accessibilityLabel={`Avatar for ${seed}`} xml={avatarXml} width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
});
