import FriendCard from '@/components/friend-card';
import { useAuthContext } from '@/hooks/use-auth-context';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { session } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to StudyBug! 🐞</Text>
      <Text style={styles.subtitle}>
        Logged in as: {session?.user?.email}
      </Text>
      <FriendCard />
      <FriendCard />
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
