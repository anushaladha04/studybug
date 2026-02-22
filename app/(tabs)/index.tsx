import SessionPost from '@/components/session-component';
import { useAuthContext } from '@/hooks/use-auth-context';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { session } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to StudyBug!</Text>
      <Text style={styles.subtitle}>Logged in as: {session?.user?.email}</Text>
      <SessionPost
        name="Brandon"
        time="2 hours ago"
        title="Morning Study Session"
        location="Library"
        totalTime="2h 30m"
      />
      <SessionPost
        name="Kimberley"
        time="2:40 pm"
        title="Chem Study Sess"
        location="Olympic Hall"
        totalTime="1h 30m"
      />
    </View>
    
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    marginBottom: 16,
  },
});


