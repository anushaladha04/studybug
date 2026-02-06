import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TimerConfig() {
    const router = useRouter();

    const [ subject, setSubject ] = useState('');
    const [ location, setLocation ] = useState('');
    const [ focusLevel, setFocusLevel ] = useState<'Low' | 'High'>('Low');
    const [ feeling, setFeeling ] = useState('');
    const [ visibility, setVisibility ] = useState<'Private' | 'Public'>('Private');

    const handleStartSession = () => {
        if (!subject || !location || !feeling) {
            alert('Please fill in all fields.');
            return;
        }

        // backend logic
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What are you studying?</Text>
            <TextInput 
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder='test' />

            <Text style={styles.title}>Location</Text>
            <TextInput 
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder='test' />
                
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

            <Text style={styles.title}>How are you feeling?</Text>
            <TextInput 
                style={styles.input}
                value={feeling}
                onChangeText={setFeeling}
                placeholder='test' />

            <Text style={styles.title}>Private/Public</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        visibility === 'Private' && styles.toggleButtonActive
                    ]}
                    onPress={() => setVisibility('Private')}
                >
                    <Text style={[
                        styles.toggleText,
                        visibility === 'Private' && styles.toggleTextActive
                    ]}>
                        Private
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        visibility === 'Public' && styles.toggleButtonActive
                    ]}
                    onPress={() => setVisibility('Public')}
                >
                    <Text style={[
                        styles.toggleText,
                        visibility === 'Public' && styles.toggleTextActive
                    ]}>
                        Public
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
        justifyContent: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
        color: "#000",
    },
    input: {
        height: 50,
        backgroundColor: "#52bb97",
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 15,
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
        marginBottom: 15,
        marginHorizontal: 20,
    },
    toggleButton: {
        flex: 1,
        backgroundColor: '#a4deca',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#52bb97',
    },
    toggleText: {
        fontSize: 16,
        color: '#1d2422',
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: '600',
    },
})