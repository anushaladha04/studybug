import { supabase } from "@/lib/supabase";
import { Link } from 'expo-router';
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setErrorMessage(authError.message); 
      setLoading(false);
      return;
    }

    // 2. Fetch the profile using the User ID (uid) from the auth step
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single(); // .single() returns one object instead of an array

    if (profileError) {
      setErrorMessage(profileError.message); 
      setLoading(false);
      return;
    } else {
      Alert.alert("Profile found! Username: " + profileData.username + ", display name: " + profileData.full_name);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studybug Login</Text>

      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="black"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>
      
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="black"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button 
          title="Sign in" 
          disabled={loading} 
          onPress={() => signInWithEmail()} />
      </View>

      <Link href="/(auth)/register">
        Don't have an account? Sign up!
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
