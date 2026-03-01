import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getNearbyPlaces, getDistanceMiles, PlaceResult } from '@/controllers/nearby-places';

export default function TimerConfig() {
    const router = useRouter();

    const [ sessionName, setSessionName ] = useState('');
    const [ location, setLocation ] = useState('');
    const [ focusLevel, setFocusLevel ] = useState<'Low' | 'High'>('Low');
    const [ note, setNote ] = useState('');
    const [ area, setArea ] = useState<'Academic' | 'Career'>('Academic');

    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [suggestions, setSuggestions] = useState<(PlaceResult & { distMi: number })[]>([]);
    const [cachedPlaces, setCachedPlaces] = useState<(PlaceResult & { distMi: number })[]>([]);

    // Get user location on mount
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({});
            setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        })();
    }, []);

    // Fetch nearby places once when userCoords are ready and cache them
    useEffect(() => {
        if (!userCoords) return;
        getNearbyPlaces(userCoords, 125).then((places) => {
            const withDist = places.map((p) => ({
                ...p,
                distMi: getDistanceMiles(userCoords, p),
            }));
            setCachedPlaces(withDist);
            setSuggestions(withDist.slice(0, 5));
        });
    }, [userCoords]);

    // Filter cached places instantly on text change — no debounce needed
    const handleLocationChange = (text: string) => {
        setLocation(text);

        if (!text.trim()) {
            setSuggestions(cachedPlaces.slice(0, 5));
            return;
        }

        const q = text.toLowerCase();
        const filtered = cachedPlaces.filter(
            (p) => p.name.toLowerCase().includes(q)
        );
        setSuggestions(filtered.slice(0, 5));
    };

    const selectSuggestion = (place: PlaceResult) => {
        setLocation(place.name);
        setSuggestions([]);
    };

    const handleStartSession = () => {
        if (!sessionName || !location || !note) {
            alert('Please fill in all fields.');
            return;
        }
        
        router.replace({
            params: { sessionName, location, focusLevel, note, area, refresh: 'true' },
            pathname: '/(tabs)/record',
        });
        // backend logic
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session Name</Text>
            <TextInput 
                style={styles.input}
                value={sessionName}
                onChangeText={setSessionName}
                placeholder='' />

            <Text style={styles.title}>Location</Text>
            <TextInput 
                style={styles.input}
                value={location}
                onChangeText={handleLocationChange}
                placeholder='Search for a place...' />
            {suggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                    {suggestions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.suggestionRow}
                            onPress={() => selectSuggestion(item)}
                        >
                            <Text style={styles.suggestionName}>{item.name}</Text>
                            <Text style={styles.suggestionDist}>
                                {item.distMi < 0.1 ? '< 0.1 mi' : `${item.distMi.toFixed(1)} mi`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
                
            <Text style={styles.title}>Level of Focus</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        focusLevel === 'Low' && styles.toggleButtonActive
                    ]}
                    onPress={() => setFocusLevel('Low')}
                >
                    <Text style={[
                        styles.toggleText,
                        focusLevel === 'Low' && styles.toggleTextActive
                    ]}>
                        Low Focus
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        focusLevel === 'High' && styles.toggleButtonActive
                    ]}
                    onPress={() => setFocusLevel('High')}
                >
                    <Text style={[
                        styles.toggleText,
                        focusLevel === 'High' && styles.toggleTextActive
                    ]}>
                        Deep Focus
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Area of Work</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        area === 'Academic' && styles.toggleButtonActive
                    ]}
                    onPress={() => setArea('Academic')}
                >
                    <Text style={[
                        styles.toggleText,
                        area === 'Academic' && styles.toggleTextActive
                    ]}>
                        Academic
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        area === 'Career' && styles.toggleButtonActive
                    ]}
                    onPress={() => setArea('Career')}
                >
                    <Text style={[
                        styles.toggleText,
                        area === 'Career' && styles.toggleTextActive
                    ]}>
                        Career
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Add a Note</Text>
            <TextInput 
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder='' />

            <TouchableOpacity style={styles.button} onPress={handleStartSession}>
                <Text style={styles.buttonText}>▶  Start</Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "white",
    },
    title: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 20,
        color: "#000",
    },
    input: {
        height: 45,
        backgroundColor: "#52bb97",
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 30,
        marginHorizontal: 20,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 15,
        marginHorizontal: 20,
    },
    toggleButton: {
        flex: 1,
        backgroundColor: '#a4deca',
        borderRadius: 25,
        padding: 15,
        marginBottom: 30,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#52bb97',
    },
    toggleText: {
        fontSize: 15,
        color: '#1d2422',
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    button: {
        paddingHorizontal: 28,
        paddingVertical: 15,
        borderWidth: 1.5,
        marginTop: 35,
        marginHorizontal: 30,
        borderColor: '#bbb',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        minWidth: 130,
    },
        buttonText: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'monospace',
        color: '#333',
    },
    suggestionsBox: {
        marginHorizontal: 20,
        marginTop: -25,
        marginBottom: 15,
        backgroundColor: '#e8f5ef',
        borderRadius: 10,
        paddingVertical: 5,
    },
    suggestionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#cde0d6',
    },
    suggestionName: {
        fontSize: 14,
        color: '#1d2422',
        flex: 1,
    },
    suggestionDist: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
});