import { StyleSheet, Text, View } from 'react-native';

interface Friend {
    full_name: string,
    location: string,
    time_studied?: number,
    last_seen?: number,
    note?: string,
}

export default function FriendCard(friend: Friend) {

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
                {friend.time_studied && <Text style={styles.label}>Time studied: {friend.time_studied} hours</Text>}
                {friend.last_seen && <Text style={styles.label}>Last seen: {friend.last_seen} hours</Text>}
                <Text style={styles.label}>Location: {location}</Text>
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
        borderRadius: 15,
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