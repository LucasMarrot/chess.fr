import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { View } from 'tamagui';

export default function ModalScreen() {
  return (
    <View>
      <Link href="/" style={styles.link}></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
