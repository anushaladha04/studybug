import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [full_name, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (password != confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }

        setLoading(true);
        const { data: { session }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: full_name,
                }
            }
        });

        if (error) {
            console.error(error);
            Alert.alert(error.message);
            setLoading(false);
            return;
        }

        if (!session) {
            Alert.alert('Registration successful! Please check your email to verify your account.');
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput 
                style={styles.input}
                value={full_name} 
                onChangeText={setFullName} 
                placeholder='Full Name' 
                placeholderTextColor='#151619'/>
            <TextInput 
                style={styles.input}
                value={email} 
                onChangeText={setEmail} 
                placeholder='Email' 
                placeholderTextColor='#151619'/>
            <TextInput 
                style={styles.input}
                value={username} 
                onChangeText={setUsername} 
                placeholder='Username' 
                placeholderTextColor='#151619'/>
            <TextInput 
                style={styles.input}
                value={password} 
                onChangeText={setPassword} 
                placeholder='Password' 
                placeholderTextColor='#151619'
                secureTextEntry />
            <TextInput 
                style={styles.input}
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                placeholder='Confirm Password' 
                placeholderTextColor='#151619'
                secureTextEntry />
            <View style={styles.buttonContainer}>
                <Button title='Sign Up' onPress={signUpWithEmail} disabled={loading} />
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
        marginBottom: 80,
        marginTop: 0,
        color: "#000",
    },
    input: {
        height: 50,
        backgroundColor: "#52bb97",
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        marginHorizontal: 30,
        fontSize: 16,
        borderWidth: 0,
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
    }
})