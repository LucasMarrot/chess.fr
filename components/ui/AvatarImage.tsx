import { Image, StyleSheet } from 'react-native';

type AvatarImageProps = {
  src?: string | null;
  accessibilityLabel?: string;
};

export function AvatarImage({ src, accessibilityLabel }: AvatarImageProps) {
  if (!src) return null;

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      resizeMode="cover"
      source={{ uri: src }}
      style={styles.image}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
