import { useAuthContext } from "@/hooks/use-auth-context";
import { StyleSheet, Text, View } from 'react-native';


export default function Home() {
  const { profile } = useAuthContext();

  return (
    <View> 
      <View style={styles.container}>
          <Text style={styles.title}>Welcome!</Text>
      </View>
        <View style={styles.container}>
          <Text>Username</Text>
          <Text>{profile?.username}</Text>
          <Text>Full name</Text>
          <Text>{profile?.full_name}</Text>
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  }
});
