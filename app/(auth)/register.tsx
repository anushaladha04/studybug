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

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (!session) {
      Alert.alert(
        "Registration successful! Please check your email to verify your account.",
      );
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <Text style={styles.title}>Create an account</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
        placeholderTextColor={MEDIUM_GRAY}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={MEDIUM_GRAY}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor={MEDIUM_GRAY}
        autoCapitalize="none"
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
          autoCapitalize="none"
          autoCorrect={false}
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
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor={MEDIUM_GRAY}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword((v) => !v)}
          hitSlop={12}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={GREEN}
            style={styles.eyeIcon}
          />
        </Pressable>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.signUpRow}>
        <Text style={styles.signUpPrompt}>Already have an account? </Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          disabled={loading}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.signUpLink}>Log In</Text>
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
  title: {
    marginTop: 125,
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
    marginBottom: 15,
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
  primaryButton: {
    marginTop: 30,
    backgroundColor: GREEN,
    borderRadius: 30,
    width: "90%",
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
