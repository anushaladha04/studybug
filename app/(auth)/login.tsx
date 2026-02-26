import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const GREEN = "#8DBF58";
const MEDIUM_GRAY = "#868683";
const LIGHT_GRAY = "#999";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      Alert.alert(authError.message);
      setLoading(false);
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <Text style={styles.login}>Log In</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Username"
        placeholderTextColor={MEDIUM_GRAY}
        editable={!loading}
      />
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={MEDIUM_GRAY}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setShowPassword((v) => !v)}
          hitSlop={12}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={GREEN}
            style={styles.eyeIcon}
          />
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [pressed && styles.pressed]}
        onPress={() => router.push("/(auth)/forgot-password")}
        disabled={loading}
      >
        <Text style={styles.forgotLink}>Forgot your password?</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={signInWithEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Log in</Text>
        )}
      </Pressable>
      <View style={styles.signUpRow}>
        <Text style={styles.signUpPrompt}>Need an account? </Text>
        <Pressable
          onPress={() => router.push("/(auth)/register")}
          disabled={loading}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    justifyContent: "flex-start",
  },
  login: {
    marginTop: 160,
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 40,
    marginHorizontal: 20,
  },
  input: {
    height: 50,
    borderWidth: 0.5,
    borderColor: MEDIUM_GRAY,
    paddingHorizontal: 17,
    marginBottom: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    fontSize: 13,
    fontFamily: "Rethink Sans",
    fontWeight: "300",
  },
  passwordWrapper: {
    position: "relative",
    marginHorizontal: 20,
    marginBottom: 0,
    height: 50,
  },
  passwordInput: {
    marginHorizontal: 0,
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    marginTop: 2,
  },
  forgotLink: {
    color: LIGHT_GRAY,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  primaryButton: {
    marginTop: 55,
    backgroundColor: GREEN,
    borderRadius: 30,
    width: "80%",
    height: "5.5%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signUpPrompt: {
    color: LIGHT_GRAY,
    fontSize: 13,
  },
  signUpLink: {
    color: MEDIUM_GRAY,
    fontSize: 13,
    fontWeight: "500",
  },
});
