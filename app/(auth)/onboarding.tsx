import Logo from "@/assets/icons/logo.svg";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const LOGO_SIZE = 280;
const LOGO_TOP = 170;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const logoY = useSharedValue(
    Dimensions.get("window").height / 2 - LOGO_SIZE / 2 - LOGO_TOP,
  );

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
  }));

  useEffect(() => {
    logoY.value = withTiming(0, {
      duration: 600,
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    });
  }, []);

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
      <Animated.View style={[styles.logoWrap, animatedLogoStyle]}>
        <Logo width={LOGO_SIZE} height={LOGO_SIZE} style={{ alignSelf: "center" }} />
      </Animated.View>
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
    paddingTop: LOGO_TOP,
  },
  logoWrap: {
    alignSelf: "center",
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
