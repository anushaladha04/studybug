import { useAuthContext } from '@/hooks/use-auth-context';
import AuthProvider from '@/providers/auth-provider';
import FriendRequestsProvider from '@/providers/friend-requests-provider';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, isLoading, profile } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (session && profile === undefined) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inIntroScreen = segments[1] === "intro";
    const inSplashScreen = segments[1] === "splash";
    const seen = profile?.has_completed_onboarding === true;

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/splash");
    } else if (session && !seen && !inIntroScreen && !inSplashScreen) {
      router.replace("/(auth)/intro");
    } else if (session && seen && inAuthGroup && !inSplashScreen) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, profile, segments[0], segments[1]]);

  if (isLoading || (session && profile === undefined)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="add-friends"
          options={{
            presentation: "card",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="friend-requests"
          options={{
            presentation: "card",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="session-details"
          options={{
            presentation: "fullScreenModal",
            title: "New Session",
          }}
        />
        <Stack.Screen
          name="session-summary"
          options={{
            presentation: "card",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'RethinkSans-Regular': require('../assets/fonts/RethinkSans-Regular.ttf'),
    'RethinkSans-Medium': require('../assets/fonts/RethinkSans-Medium.ttf'),
    'RethinkSans-SemiBold': require('../assets/fonts/RethinkSans-SemiBold.ttf'),
    'RethinkSans-Bold': require('../assets/fonts/RethinkSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <FriendRequestsProvider>
        <RootLayoutNav />
      </FriendRequestsProvider>
    </AuthProvider>
  );
}
