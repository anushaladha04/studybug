import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const GREEN_TOP = "#5EAF45";
const GREEN_BOTTOM = "#E5F0A8";

const PETAL_COUNT = 6;
const PETAL_WIDTH = 45;
const PETAL_HEIGHT = 98;
const PETAL_SPREAD = 35;
const CENTER_CIRCLE_SIZE = 48;
const ROTATION_DURATION_MS = 2000;

export default function Splash() {
  const swirl = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const goToOnboarding = () => router.replace("/(auth)/onboarding");

  const triggerExit = () => {
    scale.value = withTiming(1.15, { duration: 350 });
    opacity.value = withTiming(0, { duration: 450 }, (finished) => {
      if (finished) runOnJS(goToOnboarding)();
    });
  };

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swirl.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    const ease = Easing.bezier(0.4, 0, 0.2, 1);
    swirl.value = withSequence(
      withTiming(360, { duration: ROTATION_DURATION_MS, easing: ease }),
      withTiming(0, { duration: 0 }),
      withTiming(
        360,
        {
          duration: ROTATION_DURATION_MS,
          easing: ease,
        },
        (finished) => {
          if (finished) runOnJS(triggerExit)();
        },
      ),
    );
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GREEN_TOP, GREEN_BOTTOM]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.flowerContainer, flowerStyle]}>
        {Array.from({ length: PETAL_COUNT }, (_, i) => (
          <View
            key={i}
            style={[
              styles.petal,
              {
                transform: [
                  { rotate: `${(360 / PETAL_COUNT) * i}deg` },
                  { translateY: -PETAL_SPREAD },
                ],
              },
            ]}
          />
        ))}
        <View style={styles.centerCircle} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flowerContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  petal: {
    position: "absolute",
    width: PETAL_WIDTH,
    height: PETAL_HEIGHT,
    borderRadius: PETAL_HEIGHT / 2,
    backgroundColor: "#fff",
    opacity: 0.5,
  },
  centerCircle: {
    position: "absolute",
    width: CENTER_CIRCLE_SIZE,
    height: CENTER_CIRCLE_SIZE,
    borderRadius: CENTER_CIRCLE_SIZE / 2,
    backgroundColor: "#fff",
    opacity: 0.5,
  },
});
