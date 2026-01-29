import SignOutButton from "@/components/sign-out-button";
import { useAuthContext } from "@/hooks/use-auth-context";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

export default function HomeScreen() {
    const handlePressStart = () => {
    console.log("button pressed!");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={handlePressStart}
        activeOpacity={0.7}
      >
        <Text style={styles.startIcon}>▶</Text>
      </TouchableOpacity>
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
  startButton: {
    width: 120,
    height: 120,
    backgroundColor: '#555',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  startIcon: {
    color: 'white',
    fontSize: 50,
    marginLeft: 8,
  },
});
