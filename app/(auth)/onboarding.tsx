import Logo from "@/assets/icons/logo.svg";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      console.error(authError);
      Alert.alert(authError.message);
      setLoading(false);
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <Logo width={280} height={280} style={{ alignSelf: "center" }} />
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.primaryText}>Log In</Text>
      </Pressable>

      <Text style={styles.or}>OR</Text>

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.secondaryText}>Sign Up</Text>
      </Pressable>
    </View>
  );
}

const GREEN = "#8DBF58";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "flex-start",
    paddingTop: 170,
  },
  primaryButton: {
    marginTop: -20,
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
    color: "#FFF",
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "Rethink Sans",
  },
  or: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 30,
    fontWeight: "300",
    fontSize: 13,
    color: "868683",
  },
  secondaryButton: {
    marginTop: -18,
    backgroundColor: "#fff",
    borderRadius: 30,
    width: "80%",
    height: "5.5%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: GREEN,
  },
  secondaryText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: 500,
    fontFamily: "Rethink Sans",
  },
});
