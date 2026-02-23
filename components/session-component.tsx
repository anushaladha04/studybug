import { Image, StyleSheet, Text, View } from 'react-native';

interface SessionPostProps {
    name: string;
    time: string;
    title: string;
    location: string;
    totalTime: string;
}

export default function SessionPost({
    name,
    time,
    title,
    location,
    totalTime,
}: SessionPostProps) {

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={require('@/assets/images/profile-icon.png')} style={styles.avatar} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{time} </Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.location}>{location} </Text>
                </View>
                <View style={styles.totalTimeBlock}>
                    <Text style={styles.totalTimeLabel}>Total Time</Text>
                    <Text style={styles.totalTimeValue}>{totalTime}</Text>
                </View>
            </View>

            <View style={styles.chartPlaceholder} />

            <View style={styles.actions}>
                <Text style={styles.icon}>♡</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
      card: {
        backgroundColor: '#fff',
        paddingHorizontal: 26,
        paddingVertical: 12,
        marginTop: 2,
        marginBottom: 4,
        width: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
    },
    name: {
        fontSize: 17,
        color: '#1a1a1a',
    },
    time: {
        fontSize: 15,
        color: '#888',
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    location: {
        fontSize: 15,
        color: '#666',
        marginTop: 3,
    },
    totalTimeBlock: {
        alignItems: 'flex-end',
    },
    totalTimeLabel: {
        fontSize: 15,
        color: '#888',
    },
    totalTimeValue: {
        fontSize: 17,
        color: '#1a1a1a',
        marginTop: 2,
        fontWeight: '500',
    },
    chartPlaceholder: {
        height: 150,
        backgroundColor: '#f2f2f2',
        borderRadius: 7,
        marginTop: 10,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
        marginTop: 12,
    },
    icon: {
        fontSize: 24,
        color: '#444',
    },
});