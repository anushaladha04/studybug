import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import SignOutButton from "@/components/sign-out-button";
import { endStudySession, startStudySession } from "@/controllers/study-session";

export default function HomeScreen() {

  const [popup, setPopup] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [subject, setSubject] = useState('');
  const [ currentSessionId, setCurrentSessionId ] = useState('');

  const handlePressStart = () => {
    console.log("button pressed!");
    setPopup(true);
  };

  const handleStartSession = async (isPublic: boolean, subject: string) => {
    const startTime = new Date();

    const newStudySessionId = await startStudySession(startTime, isPublic, subject);
    setCurrentSessionId(newStudySessionId);

    setPopup(false);

    console.log(`Starting session: ${newStudySessionId}`);
  };

  const handleEndSession = async () => {
    if (! currentSessionId) {
      console.log('No study session found.')
      return;
    }
    
    const endTime = new Date();

    await endStudySession(currentSessionId, endTime);
    setCurrentSessionId('');

    console.log('Ending session...');

  }

  return (
    <View style={styles.container}>
      {!popup && (
        <View>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handlePressStart}
            activeOpacity={0.7}
          >
            <Text style={styles.startIcon}>▶</Text>
          </TouchableOpacity>
          {currentSessionId && (
            <Button
              title="End Study Session"
              onPress={() => handleEndSession()}
            />
          )}
          <SignOutButton />
        </View>
      )}
        
      {popup && (
        <View style={styles.popupCard}>
          <View style={styles.section}>
            <Text>Visibility</Text>
            <Button 
              title="Private" 
              onPress={() => setIsPublic(false)} 
            />
            <Button 
              title="Public" 
              onPress={() => setIsPublic(true)} 
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
            onPress={() => handleStartSession(isPublic, subject)} 
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
