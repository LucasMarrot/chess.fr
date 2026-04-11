import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps, Text, YStack } from 'tamagui';

// On utilise un générique <T> qui étend FieldValues de react-hook-form
interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>; // Assure que le 'name' correspond exactement aux clés du schéma Zod
  control: Control<T>; // Le control est strictement typé selon le formulaire
  label?: string;
  error?: string;
}

// Le composant devient lui aussi générique
export const FormInput = <T extends FieldValues>({
                                                   name,
                                                   control,
                                                   label,
                                                   error,
                                                   ...props
                                                 }: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <YStack width="100%" gap="$1.5">
          {label ? (
            <Text fontSize="$4" fontWeight="600" color="$color">
              {label}
            </Text>
          ) : null}

          <Input
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            size="$4"
            autoCapitalize="none"
            borderColor={error ? '$danger' : '$borderColor'}
            focusStyle={{
              borderColor: error ? '$danger' : '$borderColor',
              borderWidth: 2,
            }}
            {...props}
          />

          {error ? (
            <Text color="$danger" fontSize="$2" fontWeight="500">
              {error}
            </Text>
          ) : null}
        </YStack>
      )}
    />
  );
};
