import { intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Friend {
    full_name: string,
    location: string,
    start_time: string,
    is_active: boolean;
    note: string,
}

export default function FriendCard(friend: Friend) {
    const [ now, setNow ] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const startTime = new Date(friend.start_time);

    const formatTime = () => {
        const duration = intervalToDuration({start: startTime, end: now});
        const { months, days, hours, minutes } = duration;

        if (months && months > 0) {
            return `${months} ${months === 1 ? 'month' : 'months'}`;
        }

        if (days && days > 0) {
            return `${days} ${days === 1 ? 'day' : 'days'}`;
        }

        const parts = [];
        if (hours && hours > 0) parts.push(`${hours} hr`);
        if (minutes !== undefined && (minutes > 0 || ! hours)) parts.push(`${minutes} min`);
        
        return parts.join(' ');
    };

    //dynamic coloring based on location, needs to fetch data from 
    // last session of each user on friend's profile
    const location = friend.location;

    return (
        <View style={[styles.card]}>
            <View style={styles.avatar} />

            <View style={styles.info}>
                <Text style={styles.label}>{friend.full_name}</Text>
                <Text style={styles.label}>Location: {location}</Text>
                {friend.is_active ? (
                    <Text style={styles.label}>Time studied: {formatTime()}</Text>
                ) : (
                    <Text style={styles.label}>Last active: {formatTime()} ago</Text>
                )}
                <Text style={styles.label}>Note: {friend.note}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
        height: 97,
        width: 378,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2a2f30',
        marginLeft: 5,
        marginRight: 20,
    },
    info: {
        flex: 1,
        gap: 6,
    },
    label: {
        fontSize: 14,
    }
});