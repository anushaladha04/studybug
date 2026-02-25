import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AddToProfilePopup from '@/components/add-to-profile-popup';

export default function SessionSummary() {
    const router = useRouter();
    const { sessionName, location, duration } = useLocalSearchParams();
    const [ isPopupVisible, setIsPopupVisible ] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.congrats}>Congrats! You finished your study session!</Text>
            
            <View style={styles.statsRow}>
                <View>
                <Text style={styles.sessionNameText}>{sessionName}</Text>
                <Text style={styles.locationText}>{location}</Text>
                </View>
                <View>
                <Text style={styles.timeLabel}>Total Time</Text>
                <Text style={styles.timeValue}>{duration}</Text>
                </View>
            </View>

            {/* Add Photo Placeholder and Skip Button */}
            <Pressable style={styles.skipButton} onPress={() => setIsPopupVisible(true)}>
                <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>

            <AddToProfilePopup 
                isVisible={isPopupVisible}
                onSeeTrends={() => {
                    setIsPopupVisible(false);
                    router.push('/(tabs)/profile');
                }}
                onDone={() => {
                    setIsPopupVisible(false);
                    router.push('/(tabs)');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 24, 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    congrats: { 
        fontSize: 18, 
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        marginBottom: 30,
        textAlign: 'left'
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%',
        paddingHorizontal: 25,
        marginBottom: 30 
    },
    sessionNameText: {
        fontSize: 16,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    locationText: {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    timeValue: {
        fontSize: 16,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    skipButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#8DBF58'
    },
    skipButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#8DBF58',
        textAlign: 'center'
    }
});