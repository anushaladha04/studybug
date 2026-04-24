import MinimizeIcon from '@/assets/icons/minimize.svg';
import PlusSign from '@/assets/icons/plus.svg';
import PubPrivBg from '@/assets/icons/pub-priv-bg.svg';
import PubPrivToggle from '@/assets/icons/pub-priv-toggle.svg';
import EndSessionPopup from "@/components/end-session-popup";
import LastFocusSession, { StudySessionProps } from '@/components/last-focus-session';
import { endStudySession, fetchUserLastSession, startStudySession } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from "expo-router";
import { getLastActiveTab } from './_layout';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function RecordScreen() {
  const { session } = useAuthContext();
  const router = useRouter();
  const { sessionName, location, focusLevel, note, area, refresh } = useLocalSearchParams<{ sessionName: string, location: string, focusLevel: string, note: string, area: string, refresh: string }>();

  const [seconds, setSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [currentSessionId, setCurrentSessionId ] = useState('');
  const [sessionInfo, setSessionInfo] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [endSessionConfirmation, setEndSessionConfirmation] = useState(false);
  const [ lastStudySession, setLastStudySession ] = useState<StudySessionProps | null>(null);

  const [ isPrivacyChosen, setIsPrivacyChosen] = useState(false);
  const [ isLocating, setIsLocating ] = useState(false);

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  const togglePublic = async () => {
    const newValue = !isPublic;
    setIsPublic(newValue);
    await AsyncStorage.setItem('preferredVisibility', newValue.toString());
    Haptics.selectionAsync();
  };

  const getLocation = async (): Promise<LocationCoords> => {
    let { status } = await Location.getForegroundPermissionsAsync();
  
    if (status !== 'granted') {
      const response = await Location.requestForegroundPermissionsAsync();
      status = response.status;
    }

    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    console.log("Coordinates fetched!");

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  useEffect(() => {
  const loadPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('preferredVisibility');
      if (saved !== null) {
        setIsPublic(saved === 'true');
      }
      setIsPrivacyChosen(true); 
    } catch (e) {
      console.error("Failed to load privacy preference", e);
      setIsPrivacyChosen(true); // Set to true anyway so the app doesn't hang
    }
  };
  loadPreference();
}, []);

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
  const trigger = async () => {
    if (refresh === 'true' && isPrivacyChosen) {      
      const success = await startSessionTrigger();
      setSessionInfo(`Session: ${sessionName}\nLocation: ${location}\nFocus Level: ${focusLevel}\nArea: ${area}\nNote: ${note}`);

      if (success) {
        router.setParams({ refresh: 'false' });
      }
    }
  };

  trigger();
}, [refresh, isPrivacyChosen]);

  const startSessionTrigger = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const startTime = new Date();
      const savedVisibility = await AsyncStorage.getItem('preferredVisibility');
      
      const currentIsPublic = savedVisibility !== null 
        ? savedVisibility === 'true' 
        : isPublic;
      console.log("Private or public:", currentIsPublic);

      let latitude = null;
      let longitude = null;

      if (currentIsPublic) {
        console.log("Fetching location...")
        const coordinates = await getLocation();
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
        console.log("Fetched location!!!")
      }

      const sessionId = await startStudySession(
        sessionName, 
        startTime, 
        currentIsPublic, 
        location, 
        latitude,
        longitude,
        area, 
        focusLevel, 
        note
      );

      if (sessionId) {
        setCurrentSessionId(sessionId);
        setIsSessionActive(true);
        setTimerIsActive(true);
        await AsyncStorage.setItem('activeSessionId', sessionId);
        await AsyncStorage.setItem('sessionStartTime', startTime.toISOString());
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Session start failed:", error.message);
      return false;
    } finally {
      setIsLocating(false);
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

    router.push({
      pathname: '/session-summary',
      params: { 
        sessionId: currentSessionId,
        sessionName: sessionName,
        location: location,
        duration: seconds
      }
    });
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
    const fetchLastFocusSession = async () => {
      if (!session?.user?.id || isSessionActive) 
        return;

      try {
        const data = await fetchUserLastSession();
        if (data) {
          const formattedDate = format(new Date(data.start_time), 'dd MMM yyyy');

          setLastStudySession({
            date: formattedDate,
            totalTime: formatTime(data.duration),
            location: data.location_name,
            topic: data.session_name
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchLastFocusSession();
  }, [session, isSessionActive, refresh]);

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
        style={styles.backButton} 
        onPress={() => {
          Haptics.selectionAsync();
          const tab = getLastActiveTab();
          router.navigate(tab === 'index' ? '/(tabs)/' : `/(tabs)/${tab}` as any);
        }}
      >
        <MinimizeIcon /> 
      </Pressable>
      <Pressable style={{ position: 'absolute', top: 100, alignSelf: 'center' }} onPress={() => togglePublic()}>
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
      <View style={styles.mainContent}>
        <View style={styles.timerCircle}>
          <View style={styles.timerRect}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </View>
        </View>

        {!isSessionActive ? (
          <>
            <Pressable
                style={styles.beginSessionButton}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/session-details'); }}
              >
                <View style={styles.plusSignContainer}>
                  <PlusSign />
                </View>
                <Text style={styles.beginSessionButtonText}>Begin Session</Text>
              </Pressable>

              {lastStudySession && (
                <View style={styles.lastFocusSessionContainer}>
                  <Text style={styles.lastFocusSessionHeader}>
                    Last Focus Session
                  </Text>
                  <LastFocusSession 
                    date={lastStudySession.date}
                    totalTime={lastStudySession.totalTime}
                    location={lastStudySession.location}
                    topic={lastStudySession.topic}
                  />
                </View>
              )}
          </>
        ) : (
          <View style={styles.controlsContainer}>
            <View style={styles.buttonRow}>
              {timerIsActive ? (
                <Pressable
                  style={styles.pauseButton}
                  onPress={() => setTimerIsActive(false)}
                >
                  <Text style={styles.pauseButtonText}>❚❚  Pause</Text>
                </Pressable>
              ) : (
                  <Pressable
                    style={styles.pauseButton}
                    onPress={() => setTimerIsActive(true)}
                  >
                    <Text style={styles.pauseButtonText}>▶  Resume</Text>
                  </Pressable>
              )}
              <Pressable
                style={styles.stopButton}
                onPress={() => setEndSessionConfirmation(true)}
              >
                <Text style={styles.stopButtonText}>■  Stop</Text>
              </Pressable>
            </View>
          </View>
        )}
        <EndSessionPopup 
          isVisible={endSessionConfirmation}
          onGoBack={() => setEndSessionConfirmation(false)}
          onConfirm={endSessionTrigger}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 20,
    padding: 10,
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
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 200,
    gap: 60, 
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
  controlsContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSignContainer: {
    position: 'absolute',
    left: 15,
  },
  beginSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 282,
    height: 43,
    paddingVertical: 11.18,
    paddingHorizontal: 27.33,
    borderRadius: 38,
    backgroundColor: '#8DBF58'
  },
  beginSessionButtonText: {
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Rethink Sans',
    color: '#FFF',
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    width: 184,
    height: 43,
    paddingVertical: 11.18,
    paddingHorizontal: 27.33,
    borderRadius: 38,
    backgroundColor: '#8DBF58'
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Rethink Sans',
    color: '#FFF',
    textAlign: 'center'
  },
  stopButton: {
    width: 184,
    height: 43,
    paddingVertical: 11.18,
    paddingHorizontal: 27.33,
    borderRadius: 38,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#8DBF58'
  },
  stopButtonText: {
      fontSize: 18,
      fontWeight: 500,
      fontFamily: 'Rethink Sans',
      color: '#8DBF58',
      textAlign: 'center'
  },
  lastFocusSessionContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  lastFocusSessionHeader: {
    fontSize: 18,
    fontWeight: 500,
    fontFamily: 'Rethink Sans',
    color: '#000',
    marginBottom: 10
  }
});
