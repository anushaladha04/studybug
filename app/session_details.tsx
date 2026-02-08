import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
            

            <Text style={styles.title}>How are you feeling?</Text>
            <TextInput 
                style={styles.input}
                value={feeling}
                onChangeText={setFeeling}
                placeholder='test' />

            <Text style={styles.title}>Private/Public</Text>

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
})