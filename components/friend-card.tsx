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

    const colorStyles = {
        backgroundColor: location === 'The Study' ? '#c07cc0'
                        : location === 'Powell Library' ? '#de8787' 
                        : location === 'Canopy' ? '#65c8f2'
                        : location === 'Understory' ? '#757ee2'
                        : location === 'YRL' ? '#f2b065'
                        : '#52bb97',
       
    };

    return (
        <View style={[styles.card, colorStyles]}>
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
        marginLeft: 25,
        marginRight: 25,
        marginBottom: 10,
        marginTop: 10,
        padding: 15,
        backgroundColor: '#52bb97',
        height: 120,
        width: 350,
        borderRadius: 10,
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