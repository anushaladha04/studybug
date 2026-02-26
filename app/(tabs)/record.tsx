import { endStudySession, startStudySession } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import NewSession from '@/assets/images/new-session.svg';
import PubPrivBg from '@/assets/icons/pub-priv-bg.svg';
import PubPrivToggle from '@/assets/icons/pub-priv-toggle.svg';

export default function RecordScreen() {
  const { session } = useAuthContext();
  const router = useRouter();
  const { name, location, focusLevel, note, area, refresh } = useLocalSearchParams();

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

  useEffect(() => {
    if (refresh === 'true') {
      startSessionTrigger();
      setSessionInfo(`Session: ${name}\nLocation: ${location}\nFocus Level: ${focusLevel}\nArea: ${area}\nNote: ${note}`);
      router.setParams({ refresh: 'false' });
    }
  }, [refresh])

  const startSessionTrigger = async () => {
    const startTime = new Date();
    const sessionId = await startStudySession(name, startTime, isPublic, area, focusLevel, note);
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
      <Pressable style={{ position: 'absolute', top: 100, alignSelf: 'center' }} onPress={() => { Haptics.selectionAsync(); setIsPublic(!isPublic); }}>
        <PubPrivBg width={165} height={42} />
        <PubPrivToggle
          width={85}
          height={39}
          style={{
            position: 'absolute',
            top: 4.5,
            left: isPublic ? 4.5 : 72.5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleText, isPublic && styles.toggleActive]}>public</Text>
          <Text style={[styles.toggleText, !isPublic && styles.toggleActive]}>private</Text>
        </View>
      </Pressable>

      {/* Timer: rectangle inside a circle */}
      <View style={[styles.timerCircle, { position: 'absolute', top: 190, alignSelf: 'center' }]}>
        <View style={styles.timerRect}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      </View>

      {!isSessionActive ? (
        <View style={{ overflow: 'visible', position: 'absolute', bottom: 265, alignSelf: 'center' }}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/session-details'); }}
          >
            <NewSession width={1000} height={60} />
          </Pressable>
        </View>
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
                onPress={() => endSessionTrigger()}
              >
                <Text style={styles.buttonText}>■  Finish</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toggleRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 165,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Rethink Sans',
    color: '#0c0b0b',
    opacity: 0.4,
  },
  toggleActive: {
    opacity: 1,
    fontWeight: '700',
  },
  timerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRect: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  timerText: {
    fontSize: 40,
    fontFamily: 'Rethink Sans',
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
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
