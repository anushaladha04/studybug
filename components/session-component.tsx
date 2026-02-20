import { StyleSheet, Text, View } from 'react-native';

interface SessionPostProps {
    name: string;
    time: string;
    title: string;
    location: string;
    totalTime: number;
}

export default function SessionPost({
    name,
    time,
    title,
    location,
    totalTime,
}: SessionPostProps) {

    const postedTime = new Date(time);

    const formattedDuration = () => {
        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime - hours * 3600) / 60);

        if (hours == 0)
            return `${minutes} min`

        if (minutes == 0)
            return `${hours} hr`

        return `${hours} hr ${minutes} min`;
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.avatar} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{postedTime.toLocaleDateString()} </Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.location}>{location}</Text>
                </View>
                <View style={styles.totalTimeBlock}>
                    <Text style={styles.totalTimeLabel}>Total Time</Text>
                    <Text style={styles.totalTimeValue}>{formattedDuration()}</Text>
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
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 14,
        marginVertical: 6,
        width: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
        backgroundColor: '#2a2f30',
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    time: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    menuDots: {
        fontSize: 20,
        color: '#888',
        paddingLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
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
        fontSize: 14,
        color: '#888',
    },
    totalTimeValue: {
        fontSize: 19,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 2,
    },
    chartPlaceholder: {
        height: 150,
        backgroundColor: '#f2f2f2',
        borderRadius: 14,
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