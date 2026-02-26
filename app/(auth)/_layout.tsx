import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="splash"
        options={{ headerShown: false, title: "Splash" }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          title: "Onboarding",
          animation: "fade",
          animationDuration: 400,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: "Login",
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
          title: "Register",
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Forgot Password" }}
      />
    </Stack>
  );
}
