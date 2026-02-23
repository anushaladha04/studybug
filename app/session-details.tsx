import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TimerConfig() {
    const router = useRouter();

    const [ name, setName ] = useState('');
    const [ location, setLocation ] = useState('');
    const [ focusLevel, setFocusLevel ] = useState<'Low' | 'High'>('Low');
    const [ note, setNote ] = useState('');
    const [ area, setArea ] = useState<'Academic' | 'Career'>('Academic');

    const handleStartSession = () => {
        if (!name || !location) {
            alert('Please fill in all fields.');
            return;
        }
        
        router.replace({
            params: { name, location, focusLevel, note, area, refresh: 'true' },
            pathname: '/(tabs)/record',
        });
        // backend logic
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session Name</Text>
            <TextInput 
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder='' />

            <Text style={styles.title}>Location</Text>
            <TextInput 
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder='' />
                
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
});