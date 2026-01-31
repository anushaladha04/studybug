import { Redirect } from 'expo-router';

export default function Index() {
    // Auth flow in _layout.tsx will redirect to login if not authenticated
    return <Redirect href="/(tabs)" />;
}