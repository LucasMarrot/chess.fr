import React, { useState } from 'react';
import { Text, YStack } from 'tamagui';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { ChessButton } from '@/components/ui/ChessButton';
import { FormInput } from '@/components/ui/FormInput';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/lib/validations/auth';
import { useToastController } from '@tamagui/toast';

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim());

    if (error) {
      toast.show('Erreur', { message: error.message });
      setLoading(false);
    } else {
      toast.show('Email envoyé', { message: 'Un lien de réinitialisation a été envoyé.' });
      router.replace('/login'); // Redirection automatique après succès
    }
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
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
            placeholder="votre@email.com"
            keyboardType="email-address"
            error={errors.email?.message}
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
            Envoyer le lien
          </ChessButton>

          <ChessButton href="/login" variant="secondary" size="sm" fullWidth disabled={loading}>
            Retour à la connexion
          </ChessButton>
        </YStack>
      </YStack>
    </YStack>
  );
}
