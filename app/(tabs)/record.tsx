import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, AppState } from 'react-native';
import { endStudySession, startStudySession } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import {  useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecordScreen() {
  const { session } = useAuthContext();

  const [seconds, setSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [currentSessionId, setCurrentSessionId ] = useState('');
  const [sessionInfo, setSessionInfo] = useState("");

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  const [isPublic, setIsPublic] = useState(false);

  // Check for incomplete session on mount
  useEffect(() => {
    const checkIncompleteSession = async () => {
      const sessionId = await AsyncStorage.getItem('activeSessionId');
      if (sessionId) {
        // Found an incomplete session - end it automatically
        const endTime = new Date();
        const savedSeconds = await AsyncStorage.getItem('sessionSeconds');
        const duration = savedSeconds ? parseInt(savedSeconds, 10) : 0;
        await endStudySession(sessionId, endTime, duration);
        // Clear AsyncStorage
        await AsyncStorage.removeItem('activeSessionId');
        await AsyncStorage.removeItem('sessionStartTime');
        await AsyncStorage.removeItem('sessionSeconds');
        console.log('Ended incomplete session from previous app run');
      }
    };
    checkIncompleteSession();
  }, []);

  const startSessionTrigger = async () => {
    const startTime = new Date();
    const sessionId = await startStudySession(startTime, isPublic, "General");
    if (sessionId) {
      setCurrentSessionId(sessionId);
      setIsSessionActive(true);
      setTimerIsActive(true);
      // Save session state to AsyncStorage
      await AsyncStorage.setItem('activeSessionId', sessionId);
      await AsyncStorage.setItem('sessionStartTime', startTime.toISOString());
    }
  };

  const endSessionTrigger = async () => {
    setIsSessionActive(false);
    setSeconds(0);
    // Clear session state from AsyncStorage
    await AsyncStorage.removeItem('activeSessionId');
    await AsyncStorage.removeItem('sessionStartTime');
    await AsyncStorage.removeItem('sessionSeconds');
    const endTime = new Date();
    endStudySession(currentSessionId, endTime, seconds);
    setTimerIsActive(false);
  }

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // app went to background -> save current time and seconds
        backgroundTime.current = Date.now();
        if (isSessionActive) {
          await AsyncStorage.setItem('sessionSeconds', seconds.toString());
        }
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

      {!isSessionActive ? (
        <Pressable
          style={styles.button}
          onPress={startSessionTrigger}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      ) : (
        <>
          {/* Big Button */}
          <Pressable
            style={styles.button}
            onPress={() => setTimerIsActive(!timerIsActive)}
          >
            <Text style={styles.buttonText}>
              {timerIsActive ? 'Pause' : 'Resume'}
            </Text>
          </Pressable>

          {/* Timer */}
          <View style={styles.timer}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </View>

          {/* End Session button */}
          <Pressable
            style={styles.button}
            onPress={() => endSessionTrigger()}
          >
            <Text style={styles.buttonText}>
              End Session
            </Text>
          </Pressable>
        </>
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
    width: 250,
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerText: {
    fontSize: 40,
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
  },
});
