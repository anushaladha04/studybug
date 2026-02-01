import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { session } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.user?.email ?? 'Not signed in'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{session?.user?.user_metadata?.username ?? '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{session?.user?.user_metadata?.full_name ?? '-'}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && styles.buttonPressed]}
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  signOutButton: {
    marginTop: 24,
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
