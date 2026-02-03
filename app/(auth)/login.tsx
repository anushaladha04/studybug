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
    
        router.replace('/session_details');
}

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Studybug Login</Text>
            <TextInput 
                style={styles.input}
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                placeholder="Email" 
                placeholderTextColor='#151619'/>
            <TextInput 
                style={styles.input}
                value={password} 
                onChangeText={setPassword} 
                placeholder="Password" 
                placeholderTextColor='#1d2422'
                secureTextEntry/>
            <View style={styles.forgotPasswordContainer}>
                <Button 
                    title="Forgot Password?" 
                    onPress={() => router.push('/forgot-password')} />
            </View>
            <View style={styles.buttonContainer}>
                <Button 
                    title="Sign in" 
                    onPress={signInWithEmail} disabled={loading} />
            </View>
            <Text style={styles.or}>or</Text>
            <View style={styles.buttonContainer}>
                <Button 
                    title="Sign in with Google" 
                    onPress={() => Alert.alert('Google OAuth')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button 
                    title='No account? Register here' 
                    onPress={() => router.push('/register')} />
            </View>
        </View>
    )
}

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 160,
        marginTop: 100,
        color: "#000",
    },
    input: {
        height: 50,
        backgroundColor: "#52bb97",
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        marginHorizontal: 20,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    or: {
        textAlign: "center",
        marginTop: 30,
        marginBottom: 20,
        fontWeight: '400',
        fontSize: 14,
        color: "#666",
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 10,
    }
});

