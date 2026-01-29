import SignOutButton from "@/components/sign-out-button";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useState } from "react";
import { StyleSheet, Text, TextInput, Switch, TouchableOpacity, View, Alert, Button } from 'react-native';

export default function HomeScreen() {
  const [popup, setPopup] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  const [subject, setSubject] = useState('');

  const handlePressStart = () => {
    console.log("button pressed!");
    setPopup(true);
  };

  return (
    <View style={styles.container}>
      {!popup && (
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handlePressStart}
          activeOpacity={0.7}
        >
          <Text style={styles.startIcon}>▶</Text>
        </TouchableOpacity>)}
      {popup && (
        <View style={styles.popupCard}>
          <View style={styles.section}>
            <Text>Visibility</Text>
            <Button 
              title="Private" 
              onPress={() => setIsPrivate(true)} 
            />
            <Button 
              title="Public" 
              onPress={() => setIsPrivate(false)} 
            />
          </View>

          <View style={styles.section}>
            <Text>Subject</Text>
            <TextInput
              placeholder="Enter subject..."
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <Button 
            title="Begin Study Session" 
            onPress={() => console.log('Starting session...')} 
          />
        </View>
      )}
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
  popupCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  section: {
    marginBottom: 20,
  },
});
