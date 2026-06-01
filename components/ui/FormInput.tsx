import React, { useState, useEffect } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps, Text, YStack, XStack, Label, useTheme } from 'tamagui';
import { Eye, EyeOff } from 'lucide-react-native';
// 1. On importe les outils de Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

// (On supprime l'ancien AnimatedLabel créé avec styled())

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
}

export const FormInput = <T extends FieldValues>({
                                                   name,
                                                   control,
                                                   label,
                                                   error,
                                                   secureTextEntry = false,
                                                   ...props
                                                 }: FormInputProps<T>) => {
  const [isSecure, setIsSecure] = useState<boolean>(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  // On récupère le thème actuel pour avoir la bonne couleur de fond
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => {
        const isFloating = isFocused || (value && value.length > 0);

        // 2. Création de la valeur d'animation (0 = bas, 1 = haut)
        const floatingProgress = useSharedValue(isFloating ? 1 : 0);

        // 3. Déclenchement de la transition fluide quand isFloating change
        useEffect(() => {
          floatingProgress.value = withTiming(isFloating ? 1 : 0, {
            duration: 150, // Durée de l'animation en millisecondes
            easing: Easing.out(Easing.ease),
          });
        }, [isFloating, floatingProgress]);

        // 4. Calcul dynamique de la position Y et de la taille
        const animatedStyle = useAnimatedStyle(() => {
          return {
            transform: [
              // 3. FIX : -20 ou -21 au lieu de -25 pour un calage parfait sur la ligne
              { translateY: interpolate(floatingProgress.value, [0, 1], [0, -20]) },
              { scale: interpolate(floatingProgress.value, [0, 1], [1, 0.85]) },
            ],
          };
        });

        return (
          <YStack width="100%" gap="$1.5" marginTop={label ? '$2' : 0}>
            <YStack position="relative" justifyContent="center">
              {label && (
                // 1. On utilise Animated.View de Reanimated comme wrapper
                <Animated.View
                  pointerEvents="none"
                  style={[
                    {
                      position: 'absolute',
                      left: 15,
                      zIndex: 10,
                      backgroundColor: isFloating ? theme.background.val : 'transparent',
                      paddingHorizontal: isFloating ? 6 : 0, // Un peu de marge horizontale pour couper proprement la ligne
                      height: 'auto', // Force le conteneur à épouser strictement le texte
                    },
                    animatedStyle,
                  ]}
                >
                  {/* 2. FIX : On utilise Text au lieu de Label pour éviter la hauteur par défaut de Tamagui */}
                  <Text
                    color={isFloating ? '$color' : '$color11'}
                    fontSize="$3"
                    lineHeight={16} // On restreint la hauteur de la ligne au minimum
                  >
                    {label}
                  </Text>
                </Animated.View>
              )}

              <Input
                // 1. LE FIX EST ICI : On force React à re-créer l'input quand l'état change
                key={`input-${name}-${isSecure ? 'secure' : 'text'}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onChangeText={onChange}
                value={value}
                size="$4"
                borderColor={error ? '$danger' : isFocused ? '$color' : '$borderColor'}
                borderWidth={1}
                focusStyle={{ borderColor: '$color', borderWidth: 1.5 }}
                {...props}
                // 2. On blinde les propriétés de sécurité
                secureTextEntry={isSecure}
                type={isSecure ? 'password' : 'text'}
                autoCapitalize={secureTextEntry ? 'none' : undefined}
                autoCorrect={secureTextEntry ? false : undefined}
                spellCheck={secureTextEntry ? false : undefined} // Force la désactivation du soulignement rouge
              />

              {secureTextEntry && (
                <XStack
                  position="absolute"
                  right={0}
                  paddingHorizontal="$3"
                  onPress={() => setIsSecure(!isSecure)}
                  zIndex={100} // 6. CORRECTIF DE L'OEIL : On le force au premier plan
                  cursor="pointer" // Indique que c'est cliquable (pour le web)
                >
                  {isSecure ? <Eye size={20} /> : <EyeOff size={20} />}
                </XStack>
              )}
            </YStack>

            {error && (
              <Text color="$danger" fontSize="$2" fontWeight="500">
                {error}
              </Text>
            )}
          </YStack>
        );
      }}
    />
  );
};
