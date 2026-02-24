import BackArrow from '@/assets/icons/back-arrow.svg';
import { acceptFriendRequest, fetchFriendRequests } from '@/controllers/friends';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function FriendRequestsScreen() {
    const [ friendRequests, setFriendRequests ] = useState<any[]>([]);

    const router = useRouter();
    
    const handleAcceptRequest = async (from: string) => {
        try {
          await acceptFriendRequest(from);
          setFriendRequests(prev => prev.filter(request => request.friend_id !== from));
        } catch (error) {
          console.error(error);
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
          try {
            const data = await fetchFriendRequests();       
            setFriendRequests(data); 
          } catch (error) {
            console.error(error);
          }
        };
        
        fetchRequests();
    }, []);

    return (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Pressable
                style={styles.backButtonContainer}
                onPress={() => router.back()} 
                hitSlop={20}
            >
                <BackArrow />
            </Pressable>
            <Text style={styles.headerTitle}>Friend Requests</Text>
          </View>
          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.friend_id}
            style={{ width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}
            renderItem={({ item }) => (
            <View style={styles.resultItem}>
                <View style={styles.userInfo}>
                <Text style={styles.fullNameText}>{item.full_name}</Text>
                <Text style={styles.usernameText}>@{item.username}</Text>
                </View>
                <Pressable 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(item.friend_id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </Pressable>
            </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friend requests </Text>
              </View>
            }
        />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 13,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
    paddingHorizontal: 16,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rethink Sans',
    fontWeight: 500,
    textAlign: 'center',
    color: '#000',
    paddingTop: 13,
    marginBottom: 13
  },
  backButtonContainer: {
    position: 'absolute',
    left: 10,
    padding: 5,
  },
  resultItem: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 6,
    backgroundColor: '#F7F7F7'
  },
  userInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  fullNameText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#000',
  },
  usernameText: {
    fontSize: 12,
    color: '#787878',
    marginTop: 2,
  },
  acceptButton: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C9635',
    backgroundColor: 'rgba(174, 232, 71, 0.36)'
  },
  acceptButtonText: {
    color: '#000',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'Rethink Sans'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Rethink Sans",
    fontWeight: '400',
    color: '#000000',
  },
});