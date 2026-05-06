import StudybugText from "@/assets/images/Studybugtext.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GREEN = "#8DBF58";
const DOT_LIGHT = "#B3D4F5";
const DOT_DARK = "#1EA1FF";
const TOTAL_FEATURE_PAGES = 6;

export default function IntroScreen() {
  const router = useRouter();
  // page 0 = welcome, pages 1–6 = feature slides
  const [page, setPage] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("onboarding_seen", "true");
    router.replace("/(auth)/onboarding");
  };

  const handleNext = async () => {
    if (page < TOTAL_FEATURE_PAGES) {
      setPage(page + 1);
    } else {
      await finishOnboarding();
    }
  };

  if (page === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeTitle}>welcome to studybug!</Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => setPage(1)}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const featurePage = page - 1;

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <StudybugText width={177} height={53} />
      </View>
      <View style={styles.bottomSection}>
        {featurePage === 0 && (
          <>
            <Text style={styles.featureTitle}>Studying is Easier Together</Text>
            <Text style={styles.featureBody}>
              See when your friends are studying, join sessions, and stay accountable.
            </Text>
          </>
        )}
        {featurePage === 1 && (
          <>
            <Text style={styles.featureTitle}>Start a Study Session</Text>
            <Text style={styles.featureBody}>
              Log your task, location, and focus level in seconds.
            </Text>
          </>
        )}
        {featurePage === 2 && (
          <>
            <Text style={styles.featureTitle}>Study with Friends Anytime</Text>
            <Text style={styles.featureBody}>
              Make sessions public so friends can request to join.
            </Text>
          </>
        )}
        {featurePage === 3 && (
          <>
            <Text style={styles.featureTitle}>Share Your Progress</Text>
            <Text style={styles.featureBody}>
              Post study updates, photos, and reflections to keep friends motivated.
            </Text>
          </>
        )}
        {featurePage === 4 && (
          <>
            <Text style={styles.featureTitle}>See Your Growth</Text>
            <Text style={styles.featureBody}>
              Review weekly stats, streaks, and study insights.
            </Text>
          </>
        )}
        {featurePage === 5 && (
          <>
            <Text style={styles.featureTitle}>Interactive Map</Text>
            <Text style={styles.featureBody}>
              Find friends and see where they're studying on campus. No need to send a text every time anymore :)
            </Text>
          </>
        )}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_FEATURE_PAGES }, (_, i) => (
            <View
              key={i}
              style={[styles.dot, i === featurePage ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  logoSection: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomSection: {
    paddingBottom: 120,
    paddingHorizontal: 65,
    alignItems: "center",
  },
  welcomeTitle: {
    fontFamily: "RethinkSans-Regular",
    fontSize: 21,
    color: "#000",
    marginBottom: 40,
    textAlign: "center",
  },
  featureTitle: {
    fontFamily: "RethinkSans-Medium",
    fontWeight: "500",
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  featureBody: {
    fontFamily: "RethinkSans-Regular",
    fontWeight: "400",
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: DOT_DARK,
  },
  dotInactive: {
    backgroundColor: DOT_LIGHT,
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 30,
    width: "80%",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "RethinkSans-Medium",
  },
});
