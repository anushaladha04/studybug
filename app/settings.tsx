import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholderText}>Settings</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  signOutButton: {
    width: '90%',
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
