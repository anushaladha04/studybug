
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function sendPasswordResetEmail() {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'exp://localhost:8081/reset-password',
        });

        if (error) {
            console.error(error);
            Alert.alert('Error', error.message);
            setLoading(false);
            return;
        }

        Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
        router.replace('/login');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                placeholder='Email' />
            <View style={styles.buttonContainer}>
                <Button title="Send Reset Email" onPress={sendPasswordResetEmail} disabled={loading} />
            </View>
        </View>

    )
}

    const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: "white",
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    buttonContainer: {
        marginTop: 10,
        marginBottom: 10,
    }
})

