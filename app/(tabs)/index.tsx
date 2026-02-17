import { useAuthContext } from '@/hooks/use-auth-context';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { session } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>[ HOME ]</Text>
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
  text: {
    fontSize: 24,
    fontFamily: 'monospace',
  },
});