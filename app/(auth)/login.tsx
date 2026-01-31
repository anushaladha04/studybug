import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter()
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    async function signInWithEmail() {
        setLoading(true);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

        if (authError) {
            console.error(authError);
            Alert.alert(authError.message);
            setLoading(false);
            return;
        }
    
        router.replace('/(tabs)');
}

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Studybug Login</Text>
            <TextInput 
                style={styles.input}
                value={email} 
                onChangeText={setEmail} 
                placeholder="Email" />
            <TextInput 
                style={styles.input}
                value={password} 
                onChangeText={setPassword} 
                placeholder="Password" 
                secureTextEntry/>
            <View style={styles.forgotPasswordContainer}>
                <Button title="Forgot Password?" onPress={() => router.push('/forgot-password')} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Sign in" onPress={signInWithEmail} disabled={loading} />
            </View>
            <Text style={styles.or}>or</Text>
            <View style={styles.buttonContainer}>
                <Button title="Sign in with Google" onPress={() => Alert.alert('Google OAuth')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title='No account? Register here' onPress={() => router.push('/register')} />
            </View>
        </View>
    )
}

    const styles = StyleSheet.create({
    container: {
        marginTop: 60,
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
    },
    or: {
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
        fontWeight: '600',
        fontSize: 16,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
    }
})
