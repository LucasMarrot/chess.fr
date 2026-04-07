import { Stack } from 'expo-router';

export default function LocalGameLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'default',
      }}
    >
      <Stack.Screen
        name="config"
        options={{
          title: 'Configuration de la partie locale',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="play"
        options={{
          title: 'Partie en cours',
          headerBackTitle: 'Accueil',
        }}
      />
    </Stack>
  );
}
