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
                placeholder='Full Name' />
            <TextInput 
                style={styles.input}
                value={email} 
                onChangeText={setEmail} 
                placeholder='Email' />
            <TextInput 
                style={styles.input}
                value={username} 
                onChangeText={setUsername} 
                placeholder='Username' />
            <TextInput 
                style={styles.input}
                value={password} 
                onChangeText={setPassword} 
                placeholder='Password' 
                secureTextEntry />
            <TextInput 
                style={styles.input}
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                placeholder='Confirm Password' 
                secureTextEntry />
            <View style={styles.buttonContainer}>
                <Button title='Sign Up' onPress={signUpWithEmail} disabled={loading} />
            </View>
        </View>
    )
}

    const styles = StyleSheet.create({
        container: {
            padding: 12,
            backgroundColor: 'white',
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
            marginTop: 20,
        },
        verticallySpace: {
            marginTop: 10,
            marginBottom: 10,
            }
    })
