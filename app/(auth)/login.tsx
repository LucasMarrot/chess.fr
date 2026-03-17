import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Spinner, Text, YStack } from 'tamagui';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) Alert.alert('Erreur', error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else if (!data.session) {
      Alert.alert('Vérifiez vos emails', 'Un lien de confirmation vous a été envoyé.');
    }

    setLoading(false);
  }

  return (
    <YStack flex={1} justifyContent="center" padding="$6" gap="$4" backgroundColor="$background">
      <YStack gap="$2" marginBottom="$4">
        <Text fontSize="$9" fontWeight="700" textAlign="center">
          Chess.fr
        </Text>
        <Text fontSize="$4" textAlign="center" opacity={0.7}>
          {isSignUp ? 'Créez votre compte joueur' : 'Bon retour parmi nous'}
        </Text>
      </YStack>

      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600">
          Email
        </Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          size="$5"
        />

        <Text fontSize="$4" fontWeight="600">
          Mot de passe
        </Text>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
          autoCapitalize="none"
          size="$5"
        />

        {isSignUp && (
          <>
            <Text fontSize="$4" fontWeight="600">
              Confirmer le mot de passe
            </Text>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="********"
              secureTextEntry
              autoCapitalize="none"
              size="$5"
            />
          </>
        )}
      </YStack>

      <Button
        marginTop="$3"
        size="$5"
        theme="Primary"
        disabled={loading}
        onPress={isSignUp ? handleSignUp : handleSignIn}
      >
        {loading ? <Spinner color="$color" /> : isSignUp ? "S'inscrire" : 'Se connecter'}
      </Button>

      <Button
        marginTop="$2"
        chromeless
        disabled={loading}
        onPress={() => setIsSignUp((prev) => !prev)}
      >
        {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un profil'}
      </Button>
    </YStack>
  );
}
