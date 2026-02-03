import { useAuthContext } from '@/hooks/use-auth-context';
import { StyleSheet, Text, View, Button, AppState } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { endStudySession, startStudySession } from "@/app/controllers/study-session";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const { session } = useAuthContext();

  const [seconds, setSeconds] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [ currentSessionId, setCurrentSessionId ] = useState('');
  const [sessionInfo, setSessionInfo] = useState("");

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  useEffect(() => {
    async function getRows() {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (!error && data) {
        if (data.length > 0) {
          // sort by time
          const sortedData = data.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
          setSessionInfo(`Latest session subject: ${sortedData[0].subject}, duration: ${sortedData[0].duration}s`);
        } else {
          setSessionInfo("No study sessions found for this user.");
        }
      }
    }

    getRows();
  }, []);


  // call this function whenever timerIsActive changes
  useEffect(() => {
    let interval: any;
    if (timerIsActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    // Handle background app running
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // app went to background -> save current time
        backgroundTime.current = Date.now();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // app returned to foreground: calculate elapsed time
        if (backgroundTime.current && timerIsActive) {
          const elapsed = Math.floor((Date.now() - backgroundTime.current) / 1000);
          setSeconds((s) => s + elapsed);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [timerIsActive]);

  const handleStartSession = async (isPublic: boolean, subject: string) => {
    const startTime = new Date();

    const newStudySessionId = await startStudySession(startTime, isPublic, subject);
    setCurrentSessionId(newStudySessionId);

    console.log(`Starting session: ${newStudySessionId}`);
  };

  const handleEndSession = async () => {
    if (! currentSessionId) {
      console.log('No study session found.')
      return;
    }
    
    const endTime = new Date();

    await endStudySession(currentSessionId, endTime, seconds);
    setCurrentSessionId('');

    console.log('Ending session...');
  }

  const beginSession = () => {
    setSessionStarted(true);
    setTimerIsActive(true);

    // placeholders, add ui logic for this later
    handleStartSession(true, 'Math');
  };

  const endSession = () => {
    setSessionStarted(false);
    setTimerIsActive(false);

    handleEndSession();
  }

  return (
    <View style={styles.container}>
      {!sessionStarted && (
        <Button title="New Session" onPress={() => beginSession()} />
      )}
      {sessionStarted && (
        <Button title={timerIsActive ? "Pause" : "Start"} onPress={() => setTimerIsActive(!timerIsActive)} />
      )}
      {sessionStarted && (
        <Button title="End Session" onPress={() => endSession()} />
      )}
      
      <Text>{seconds}s</Text>
      <Text>{sessionInfo}</Text>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
