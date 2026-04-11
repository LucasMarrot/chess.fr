import React, { useState } from 'react';
import { ScrollView, Text, YStack } from 'tamagui';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { ChessButton } from '@/components/ui/ChessButton';
import { FormInput } from '@/components/ui/FormInput';
import { registerSchema, RegisterFormValues } from '@/lib/validations/auth';
import { useToastController } from '@tamagui/toast';
import { ChessLink } from '@/components/ui/ChessLink';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          name: data.username.trim(), // On sauvegarde l'username pour ta fonction resolveUserName
        },
      },
    });

    if (error) {
      toast.show('Erreur', { message: error.message });
    } else if (authData.session === null) {
      toast.show('Vérifiez vos emails', { message: 'Un lien de confirmation vous a été envoyé.' });
      router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
        paddingVertical="$6"
      >
        <YStack width="80%" maxWidth={400} gap="$4">
          <YStack gap="$2" marginBottom="$2" alignItems="center">
            <Text fontSize="$9" fontWeight="700">
              Chess.fr
            </Text>
          </YStack>

          <YStack gap="$3">
            <FormInput
              name="username"
              control={control}
              label="Nom d'utilisateur"
              error={errors.username?.message}
            />

            <FormInput
              name="email"
              control={control}
              label="Email"
              keyboardType="email-address"
              error={errors.email?.message}
            />

            <FormInput
              name="password"
              control={control}
              label="Mot de passe"
              secureTextEntry
              error={errors.password?.message}
            />

            <FormInput
              name="confirmPassword"
              control={control}
              label="Confirmer le mot de passe"
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          </YStack>

          <YStack gap="$3" marginTop="$2">
            <ChessButton
              loading={loading}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit(onSubmit)}
            >
              S'inscrire
            </ChessButton>

            <ChessButton href="/login" variant="ghost" size="sm" fullWidth disabled={loading}>
              Déjà un compte ? Se connecter
            </ChessButton>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
