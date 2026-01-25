import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function TabOneScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [full_name, setFullName] = useState('');

  async function signInWithEmail() {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.error(authError);
      return;
    }

    // 2. Fetch the profile using the User ID (uid) from the auth step
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single(); // .single() returns one object instead of an array

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      Alert.alert("Profile found! Username: " + profileData.username + ", display name: " + profileData.full_name);
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          full_name: full_name,
        },
      },
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  async function onSignOutButtonPress() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
  } else {
    Alert.alert("Successfully signed out!");
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Studybug Login</Text>
      
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username"
          placeholderTextColor="black"
          style={styles.input}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setFullName(text)}
          value={full_name}
          placeholder="Full name"
          placeholderTextColor="black"
          style={styles.input}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="black"
          autoCapitalize={'none'}
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
          autoCapitalize={'none'}
          style={styles.input}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign out" onPress={onSignOutButtonPress} />
      </View>

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
  }
});
