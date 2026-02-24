import { Image, StyleSheet, Text, View } from 'react-native';

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

    const formatPostedTime = () => {
        const postedTime = new Date(time);
        const now = new Date();

        if (postedTime.toLocaleDateString() === now.toLocaleDateString())
            return postedTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        else
            return postedTime.toLocaleDateString();
    };

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
                <Image source={require('@/assets/images/profile-icon.png')} style={styles.avatar} />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{formatPostedTime()} </Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.location}>{location} </Text>
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
        paddingHorizontal: 29,
        paddingVertical: 19,
        marginTop: 2,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderColor: '#dedede',
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
        marginRight: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        color: '#000',
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
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Rethink Sans',
        color: '#000',
    },
    location: {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        color: '#000'
    },
    totalTimeBlock: {
        alignItems: 'flex-end',
    },
    totalTimeLabel: {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        color: '#000'
    },
    totalTimeValue: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Rethink Sans',
        color: '#000',
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