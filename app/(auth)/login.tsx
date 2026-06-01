import React, { useState } from 'react';
import { Text, YStack, XStack } from 'tamagui';
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) {
      toast.show('Erreur de connexion', { message: error.message });
    }
    setLoading(false);
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
      padding="$4"
    >
      <YStack width="100%" maxWidth={400} gap="$6" padding="$4">
        <YStack gap="$2" alignItems="center">
          <Text fontSize="$9" fontWeight="800">
            Chess.fr
          </Text>
        </YStack>

        <YStack gap="$4">
          <FormInput
            name="email"
            control={control}
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />

          <YStack gap="$2">
            <FormInput
              name="password"
              control={control}
              label="Mot de passe"
              secureTextEntry // C'est tout ce qu'il faut maintenant !
              error={errors.password?.message}
            />

            {/* Ligne d'actions sous le mot de passe nettoyée */}
            <XStack justifyContent="flex-end" alignItems="center" marginTop="$1">
              <ChessLink
                href="/forgot-password"
                disabled={loading}
                fontSize="$3"
                color="$color11"
                hoverStyle={{ opacity: 0.8 }}
              >
                Mot de passe oublié ?
              </ChessLink>
            </XStack>
          </YStack>
        </YStack>

        <YStack gap="$4" marginTop="$2">
          <ChessButton
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
          >
            Se connecter
          </ChessButton>

          <YStack alignItems="center" gap="$2" marginTop="$4">
            <Text fontSize="$3" color="$color11">
              Pas encore de compte ?
            </Text>
            <ChessButton href="/register" variant="ghost" size="sm" fullWidth disabled={loading}>
              Créer un profil
            </ChessButton>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
