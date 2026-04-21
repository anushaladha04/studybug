import X from '@/assets/icons/X.svg';
import { getDistanceMiles, getNearbyPlaces, PlaceResult } from '@/controllers/nearby-places';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';


export default function SessionDetails() {
    const router = useRouter();

    const [sessionName, setSessionName] = useState<string | undefined>(undefined);
    const [location, setLocation] = useState('');
    const [note, setNote] = useState('');
    const [area, setArea] = useState<'Academic' | 'Career'>('Academic');

    const [allPlaces, setAllPlaces] = useState<PlaceResult[]>([]);
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [closestPlaceName, setClosestPlaceName] = useState('');

    // Fetch location + all nearby places once on mount
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({});
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setUserCoords(coords);

            const places = await getNearbyPlaces(coords, 75);
            setAllPlaces(places);

            // Default location placeholder to closest place
            if (places.length > 0) {
                setClosestPlaceName(places[0].name);
            }
        })();
    }, []);

    // Filter cached places locally on each keystroke
    useEffect(() => {
        if (!allPlaces.length) return;
        const q = location.trim().toLowerCase();
        if (!q) {
            setSuggestions(allPlaces.slice(0, 5));
            return;
        }
        const filtered = allPlaces.filter(
            (p) => p.name.toLowerCase().includes(q)
        );
        setSuggestions(filtered.slice(0, 5));
    }, [location, allPlaces]);

    const [startTime] = useState(() => new Date().toISOString());
    const getSessionTime = (isoString: string) => {
        const hour = new Date(isoString).getHours();
        if (hour < 6 || hour >= 20) return 'Night Session';
        if (hour < 12) return 'Morning Session';
        if (hour < 14) return 'Lunch Session';
        if (hour < 18) return 'Afternoon Session';
        return 'Evening Session';
    };
    const sessionTimePlaceholder = startTime ? getSessionTime(startTime as string): '';

    const FOCUS_LEVELS = ['Low', 'Medium', 'High'] as const;
    type FocusLevel = (typeof FOCUS_LEVELS)[number];
    const [focusLevel, setFocusLevel] = useState<FocusLevel>('Low');

    const handleStartSession = () => {
        const finalLocation = location || closestPlaceName;
        if (!finalLocation) {
            alert('Please fill in location.');
            return;
        }

        router.replace({
            params: { sessionName: sessionName || sessionTimePlaceholder, location: finalLocation, focusLevel, note, area, refresh: 'true' },
            pathname: '/(tabs)/record',
        });
    };

    
    const TRACK_WIDTH = 260;
    const THUMB_SIZE = 16;
    const DOT_SIZE = 16;

    const segmentWidth = TRACK_WIDTH / (FOCUS_LEVELS.length - 1);

    const xPos = useRef(new Animated.Value(0)).current;

    const offsetRef = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                xPos.stopAnimation(value => {
                    offsetRef.current = value;
                    xPos.setOffset(value);
                    xPos.setValue(0);
                });
            },

            onPanResponderMove: (_, gestureState) => {
                const raw = offsetRef.current + gestureState.dx;
                const clamped = Math.max(0, Math.min(raw, TRACK_WIDTH));
                xPos.setValue(clamped - offsetRef.current);
            },

            onPanResponderRelease: () => {
                xPos.flattenOffset();

                xPos.stopAnimation(value => {
                    const clamped = Math.max(0, Math.min(value, TRACK_WIDTH));
                    const snappedIndex = Math.round(clamped / segmentWidth);
                    const snappedValue = snappedIndex * segmentWidth;

                    Animated.spring(xPos, {
                        toValue: snappedValue,
                        useNativeDriver: false,
                    }).start();

                    setFocusLevel(FOCUS_LEVELS[snappedIndex]);
                });
            },
        })
    ).current;

    const [fillPosition, setFillPosition] = useState(0);

useRef(
    xPos.addListener(({ value }) => {
        setFillPosition(value);
    })
).current;

    const fillWidth = Animated.add(xPos, THUMB_SIZE / 2);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>New Timer</Text>
                <Pressable style={styles.closeButton} onPress={() => router.back()}>
                    <X />
                </Pressable>
            </View>

            <Text style={styles.label}>Session Name</Text>
            <TextInput style={styles.input} value={sessionName} onChangeText={setSessionName} placeholder={sessionTimePlaceholder} placeholderTextColor='#000000' autoCorrect={false} />

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={location}
                placeholder={closestPlaceName}
                placeholderTextColor='#000000'
                autoCorrect={false}
                onChangeText={(text) => { setLocation(text); setShowSuggestions(true); }}
                onFocus={() => {
                    setShowSuggestions(true);
                    if (!location.trim() && allPlaces.length) {
                        setSuggestions(allPlaces.slice(0, 5));
                    }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((place) => {
                        const dist = userCoords ? getDistanceMiles(userCoords, place) : null;
                        return (
                            <Pressable
                                key={place.id}
                                style={styles.suggestionItem}
                                onPress={() => {
                                    setLocation(place.name);
                                    setShowSuggestions(false);
                                }}
                            >
                                <Text style={styles.suggestionName} numberOfLines={1}>{place.name}</Text>
                                {dist !== null && (
                                    <Text style={styles.suggestionDist}>
                                        {dist < 0.1 ? `${Math.round(dist * 5280)} ft` : `${dist.toFixed(1)} mi`}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}

            <Text style={styles.label}>Area of Work</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleButton, area === 'Academic' && styles.toggleButtonActive]}
                    onPress={() => setArea('Academic')}>
                    <Text style={[styles.toggleText, area === 'Academic' && styles.toggleTextActive]}>
                        Academic
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toggleButton, area === 'Career' && styles.toggleButtonActive]}
                    onPress={() => setArea('Career')}
                >
                    <Text style={[styles.toggleText, area === 'Career' && styles.toggleTextActive]}>
                        Career
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Focus Level</Text>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: TRACK_WIDTH, height: 30, justifyContent: 'center' }}>

                    {/* Track */}
                    <View style={[styles.track, { width: TRACK_WIDTH + DOT_SIZE, left: -DOT_SIZE / 2 }]} />

                    {/* Fill */}
                    <Animated.View
                    style={[
                        styles.trackFill,
                        { width: Animated.add(fillWidth, DOT_SIZE / 2), left: -DOT_SIZE / 2  },
                    ]}
                    />

                    {/* Dots */}
                    {FOCUS_LEVELS.map((_, i) => (
                        <View
                            key={i}
                            style={[ 
                                styles.dot,
                                { left: i * segmentWidth - DOT_SIZE / 2, },
                                { borderColor: fillPosition >= i * segmentWidth ? '#1EA1FF' : '#BBE3FF' },
                            ]}
                        />
                    ))}

                    {/* Thumb */}
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.thumb,
                            { transform: [{ translateX: Animated.add(xPos, -THUMB_SIZE / 2) }], },
                        ]}
                    />
                </View>

                {/* Labels */}
                <View style={{ width: TRACK_WIDTH, height: 20, marginTop: 6 }}>
                    {FOCUS_LEVELS.map((level, i) => (
                        <Text
                            key={level}
                            style={{
                                position: 'absolute',
                                left: i * segmentWidth - 25,
                                width: 50,
                                textAlign: 'center',
                                fontSize: 12,
                                fontFamily: 'Rethink Sans',
                            }}
                        >
                            {level}
                        </Text>
                    ))}
                </View>
            </View>

            <Text style={styles.label}>Add a Note</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} autoCorrect={false}/>

            <View style={styles.line}/>

            <Pressable
                      style={styles.sessionButton}
                      onPress={() => handleStartSession()}
                    >
                      <Text style={styles.buttonText}>Start Session</Text>
                    </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 60,
        paddingHorizontal: 16,
        marginTop: 40,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Rethink Sans',
        fontWeight: '500',
        textAlign: 'center',
        color: '#000',
        paddingTop: 13,
        marginBottom: 13,
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        padding: 5,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 20,
        fontFamily: 'Rethink Sans',
        fontWeight: '500',
    },
    input: {
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#AFAFAF',
        paddingHorizontal: 15,
        marginBottom: 30,
        marginHorizontal: 20,
        fontSize: 14,
        fontFamily: 'Rethink Sans',
    },
    suggestionsContainer: {
        marginHorizontal: 20,
        marginTop: -25,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#AFAFAF',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    suggestionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E0E0E0',
    },
    suggestionName: {
        fontSize: 14,
        fontFamily: 'Rethink Sans',
        flex: 1,
    },
    suggestionDist: {
        fontSize: 12,
        fontFamily: 'Rethink Sans',
        color: '#888',
        marginLeft: 8,
    },
    track: {
        position: 'absolute',
        height: 16,
        borderRadius: 8,
        backgroundColor: '#BBE3FF',
    },
    trackFill: {
        position: 'absolute',
        height: 16,
        borderRadius: 8,
        backgroundColor: '#1EA1FF',
    },
    dot: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#BBE3FF',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    thumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#1EA1FF',
        zIndex: 2,
        elevation: 3,
        top: 7,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 15,
        marginHorizontal: 20,
    },
    toggleButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#afafaf',
        borderRadius: 20,
        padding: 10,
        marginBottom: 30,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#1EA1FF',
        borderColor: '#1EA1FF',
    },
    toggleText: {
        fontSize: 16,
        fontFamily: 'Rethink Sans',
    },
    toggleTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    line: {
        height: 1,
        backgroundColor: "#CFCFCF",
        marginBottom: 30,
        marginTop: 60,
        marginHorizontal: -10,
    },
    sessionButton: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        width: 282,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        backgroundColor: '#8DBF58'
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#FFF',
        textAlign: 'center'
    },

});