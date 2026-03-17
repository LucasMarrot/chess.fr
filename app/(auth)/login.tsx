import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
    // États pour les champs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // État pour basculer entre Login et Sign Up
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fonction pour la connexion
    async function handleSignIn() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Erreur', error.message);
        setLoading(false);
    }

    // Fonction pour l'inscription
    async function handleSignUp() {
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            Alert.alert('Erreur', error.message);
        } else if (!data.session) {
            Alert.alert('Vérifiez vos emails', 'Un lien de confirmation vous a été envoyé.');
        }
        setLoading(false);
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Chess.fr</ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
                {isSignUp ? 'Créez votre compte joueur' : 'Bon retour parmi nous'}
            </ThemedText>

            <View style={styles.form}>
                {/* Champ Email */}
                <ThemedText type="defaultSemiBold">Email</ThemedText>
                <TextInput
                    onChangeText={setEmail}
                    value={email}
                    placeholder="votre@email.com"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />

                {/* Champ Mot de passe */}
                <ThemedText type="defaultSemiBold">Mot de passe</ThemedText>
                <TextInput
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    placeholder="********"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    style={styles.input}
                />

                {/* Champ Confirmation (Affiché uniquement si isSignUp est vrai) */}
                {isSignUp && (
                    <>
                        <ThemedText type="defaultSemiBold">Confirmer le mot de passe</ThemedText>
                        <TextInput
                            onChangeText={setConfirmPassword}
                            value={confirmPassword}
                            secureTextEntry
                            placeholder="********"
                            placeholderTextColor="#888"
                            autoCapitalize="none"
                            style={styles.input}
                        />
                    </>
                )}
            </View>

            {/* Bouton Principal (Change selon le mode) */}
            <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                disabled={loading}
                onPress={isSignUp ? handleSignUp : handleSignIn}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <ThemedText style={styles.buttonText}>
                        {isSignUp ? "S'inscrire" : "Se connecter"}
                    </ThemedText>
                )}
            </TouchableOpacity>

            {/* Bouton pour basculer entre les modes */}
            <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsSignUp(!isSignUp)}
            >
                <ThemedText type="link">
                    {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un profil"}
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center' },
    title: { textAlign: 'center', marginBottom: 10 },
    subtitle: { textAlign: 'center', marginBottom: 40, opacity: 0.7 },
    form: { gap: 10, marginBottom: 20 },
    input: {
        backgroundColor: '#f5f5f5',
        color: '#000',
        padding: 15,
        borderRadius: 12,
        marginTop: 5,
        marginBottom: 10,
        fontSize: 16,
    },
    button: {
        alignItems: 'center',
        padding: 18,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    }
});