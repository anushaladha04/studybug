import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, AppState } from 'react-native';
import { endStudySession, startStudySession } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import {  useRef, useEffect } from 'react';

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
        onPress={() => setTimerIsActive(!timerIsActive)}
      >
        <Text style={styles.buttonText}>
          {isSessionActive ? 'STOP' : 'Start!'}
        </Text>
      </Pressable>

      {/* Timer */}
      <View style={styles.timer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
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
