import EndSessionPopup from "@/components/end-session-popup";
import { endStudySession, startStudySession } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RecordScreen() {
  const { session } = useAuthContext();
  const router = useRouter();
  const { name, location, focusLevel, note, area, refresh } = useLocalSearchParams();

  const [seconds, setSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [currentSessionId, setCurrentSessionId ] = useState('');
  const [sessionInfo, setSessionInfo] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [endSessionConfirmation, setEndSessionConfirmation] = useState(false);

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

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

  useEffect(() => {
    if (refresh === 'true') {
      startSessionTrigger();
      setSessionInfo(`Session: ${name}\nLocation: ${location}\nFocus Level: ${focusLevel}\nArea: ${area}\nNote: ${note}`);
      router.setParams({ refresh: 'false' });
    }
  }, [refresh])

  const startSessionTrigger = async () => {
    const startTime = new Date();
    const sessionId = await startStudySession(name, startTime, isPublic, location, area, focusLevel, note);
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
      <Pressable
        style={styles.button}
        onPress={() => setIsPublic(!isPublic)}
      >
        <Text style={styles.toggleText}>
          [ {isPublic ?  'PUBLIC'  : 'PRIVATE'} ]
        </Text>
      </Pressable>

      {/* Timer: rectangle inside a circle */}
      <View style={styles.timerCircle}>
        <View style={styles.timerRect}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      </View>

      {!isSessionActive ? (
        <Pressable
          style={styles.button}
          onPress={() => router.push('/session-details')}
        >
          <Text style={styles.buttonText}>New Session</Text>
        </Pressable>
      ) : (
        <>
          {timerIsActive ? (
            <Pressable
              style={[styles.button, styles.buttonFilled]}
              onPress={() => setTimerIsActive(false)}
            >
              <Text style={[styles.buttonText, styles.buttonFilledText]}>❚❚  Pause</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonFilled]}
                onPress={() => setTimerIsActive(true)}
              >
                <Text style={[styles.buttonText, styles.buttonFilledText]}>▶  Resume</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => setEndSessionConfirmation(true)}
              >
                <Text style={styles.buttonText}>■  Finish</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
      <EndSessionPopup 
        isVisible={endSessionConfirmation}
        onGoBack={() => setEndSessionConfirmation(false)}
        onConfirm={endSessionTrigger}
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
    gap: 28,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#555',
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRect: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontVariant: ['tabular-nums'],
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minWidth: 130,
  },
  buttonFilled: {
    backgroundColor: '#a0a0a0',
    borderColor: '#a0a0a0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#333',
  },
  buttonFilledText: {
    color: '#fff',
  },
});
