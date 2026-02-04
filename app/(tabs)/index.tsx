import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [isPublic, setIsPublic] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <Pressable
        style={styles.toggle}
        onPress={() => setIsPublic(!isPublic)}
      >
        <Text style={styles.toggleText}>
          [ {isPublic ? 'PUBLIC' : 'PRIVATE'} ]
        </Text>
      </Pressable>

      {/* Big Button */}
      <Pressable
        style={styles.button}
        onPress={() => setIsSessionActive(!isSessionActive)}
      >
        <Text style={styles.buttonText}>
          {isSessionActive ? 'STOP' : 'Start!'}
        </Text>
      </Pressable>

      {/* Timer */}
      <View style={styles.timer}>
        <Text style={styles.timerText}>00:00:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  toggle: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  button: {
    width: 150,
    height: 150,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timer: {
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  timerText: {
    fontSize: 40,
    fontFamily: 'monospace',
  },
});
