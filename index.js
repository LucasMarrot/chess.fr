import 'react-native-gesture-handler';
import '@tamagui/native/setup-zeego';
import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';
import 'expo-router/entry';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
