import React, { useState } from 'react';
import { Text, YStack } from 'tamagui';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { ChessButton } from '@/components/ui/ChessButton';
import { FormInput } from '@/components/ui/FormInput';
import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import { useToastController } from '@tamagui/toast';
import { ChessLink } from '@/components/ui/ChessLink';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });

    if (error) {
      toast.show('Erreur de connexion', { message: error.message });
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    const email = getValues('email');
    if (!email) {
      toast.show('Attention', {
        message:
          'Veuillez entrer votre email dans le champ prévu à cet effet pour réinitialiser le mot de passe.',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      toast.show('Erreur', { message: error.message });
    } else {
      toast.show('Email envoyé', { message: 'Un lien de réinitialisation vous a été envoyé.' });
    }
    setLoading(false);
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
      {/* Conteneur principal à 80% centré */}
      <YStack width="80%" maxWidth={400} gap="$5">
        <YStack gap="$2" marginBottom="$4" alignItems="center">
          <Text fontSize="$9" fontWeight="700">
            Chess.fr
          </Text>
        </YStack>

        <YStack gap="$3">
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
        </YStack>

        <ChessLink
          href="/forgot-password"
          disabled={loading}
          className="text-[5px] inline-block text-left"
        >
          Mot de passe oublié ?
        </ChessLink>

        <YStack gap="$3" marginTop="$2">
          <ChessButton
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
          >
            Se connecter
          </ChessButton>

          <ChessButton href="/register" variant="ghost" size="sm" fullWidth disabled={loading}>
            Pas de compte ? Créer un profil
          </ChessButton>
        </YStack>
      </YStack>
    </YStack>
  );
}
