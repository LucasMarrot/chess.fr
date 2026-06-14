import {z} from 'zod';

export const loginSchema = z.object({
    email: z.string().min(1, 'L\'email est requis').email('Format d\'email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
            .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères'),
        email: z.string().min(1, 'L\'email est requis').email('Format d\'email invalide'),
        password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
        confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'], // Le message d'erreur sera attaché au champ confirmPassword
    });

export const forgotPasswordSchema = z.object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
