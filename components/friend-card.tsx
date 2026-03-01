import ClockIcon from '@/assets/icons/clock';
import { intervalToDuration } from 'date-fns';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


interface Friend {
    pfp: string,
    full_name: string,
    location: string,
    start_time: string,
    end_time: string,
    is_active: boolean;
    note: string,
}

export default function FriendCard(friend: Friend) {
    const SUPABASE_URL = 'https://eabnnwzgebqtarbubyat.supabase.co';

    const getPublicUrl = (path: string) => {
        if (!path) 
            return 'default_avatar_url_here';
        return `${SUPABASE_URL}/storage/v1/object/public/profile_pictures/${path}`;
    };

    const [ now, setNow ] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const referenceTime = friend.is_active ? new Date(friend.start_time) : new Date(friend.end_time);

    const formatTime = () => {
        const duration = intervalToDuration({start: referenceTime, end: now});
        const { months, days, hours, minutes } = duration;

        if (months && months > 0) {
            return `${months} ${months === 1 ? 'month' : 'months'}`;
        }

        if (days && days > 0) {
            return `${days} ${days === 1 ? 'day' : 'days'}`;
        }

        const parts = [];
        if (! hours && ! minutes) 
            return 'Just now';
        if (hours && hours > 0) 
            parts.push(`${hours} hr`);
        if (minutes !== undefined && (minutes > 0 || ! hours)) 
            parts.push(`${minutes} min`);
        
        return parts.join(' ');
    };

    const location = friend.location;

    return (
        <View style={[styles.card]}>
            <ExpoImage
                style={styles.avatar}
                source={getPublicUrl(friend.pfp)}
                placeholder={require('@/assets/images/profile-icon.png')}
                contentFit="cover"
                placeholderContentFit="cover"
                transition={500}
                cachePolicy="memory-disk"
            />

            <View style={styles.contentContainer}>
                <Text style={styles.nameText}>{friend.full_name}</Text>
                <Text style={styles.detailText}>Location: {location}</Text>
                <Text style={styles.detailText}>Note: {friend.note}</Text>                
            </View>

            <View style={[styles.statusBadge, 
                    !friend.is_active && styles.inactiveBadge]}>
                    <Text style={styles.statusText}>
                        {friend.is_active ? 'Active' : 'Inactive'}
                    </Text>
                </View>

                <View style={styles.metricsContainer}>
                    <Text style={styles.metricText}>0.5 mi {/*Need to add actual data*/}</Text>
                    <View style={styles.timeContainer}>
                        <ClockIcon />
                        <Text style={styles.metricText}>{formatTime()}{! friend.is_active && ' ago'}</Text>
                    </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        gap: 21,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
        height: 97,
        width: '90%',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative'
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 5
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 15,
    },
    nameText: {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#000',
    },
    detailText: {
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        color: '#000',
    },
    statusBadge: {
        position: 'absolute',
        top: 9,
        right: 14,
        backgroundColor: '#1C9635',
        paddingHorizontal: 15,
        paddingVertical: 3,
        borderRadius: 12,
    },
    inactiveBadge: {
        backgroundColor: '#F33D40'
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    metricsContainer: {
        position: 'absolute',
        bottom: 9,
        right: 14,
        alignItems: 'flex-end',
    },
    metricText: {
        fontSize: 12,
        color: '#555',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2
    }
});