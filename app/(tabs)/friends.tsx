import SearchIcon from '@/assets/images/search.svg';
import FriendCard from '@/components/friend-card';
import { acceptFriendRequest, fetchAllFriends, fetchByUsername, fetchFriendRequests, requestFriend } from '@/controllers/friends';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'requests'>('active');

  const [ searchQuery, setSearchQuery ] = useState('');
  const [ searchResults, setSearchResults ] = useState<any[]>([]);
  const [ friendRequests, setFriendRequests ] = useState<any[]>([]);
  const [ friends, setFriends ] = useState<any[]>([]);

  const isSearching = searchQuery.length > 0;

  const handleRequest = async (to: string, username: string) => {
    try {
      await requestFriend(to);
      Alert.alert(`Alert sent to ${username}`)
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFriends = async () => {
      try {
        const data = await fetchAllFriends();    
        setFriends(data); 
      } catch (error) {
        console.error(error);
      }
    };

  const handleAcceptRequest = async (from: string) => {
    try {
      await acceptFriendRequest(from);
    } catch (error) {
      console.error(error);
    }

    setFriendRequests(prev => prev.filter(request => request.friend_id !== from));
    await fetchFriends();
  };

  useEffect(() => {
    const searchUsers = async (query: string) => {
      try {
        const data = await fetchByUsername(query);        
        setSearchResults(data); 
      } catch (error) {
        console.error(error);
      }
    };
    
    searchUsers(searchQuery);
  }, [searchQuery]);

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

  useEffect(() => {
    fetchFriends();
  }, []);

  const activeFriends = friends.filter(friend => friend.is_active === true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>

      <View style={styles.searchBar}>
        <SearchIcon width={16} height={16} fill='transparent' styles={styles.searchIcon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#717171"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

      </View>

      { !isSearching && (
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Friends</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Requests</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {isSearching ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center' }}
              renderItem={({ item }) => (
                <View style={styles.resultItem}>
                  <View style={styles.userInfo}>
                    <Text style={styles.fullNameText}>{item.full_name}</Text>
                    <Text style={styles.usernameText}>@{item.username}</Text>
                  </View>
                  <Pressable 
                    style={styles.addButton}
                    onPress={() => handleRequest(item.id, item.username)}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </Pressable>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
            />
          ) : (
          <View style={styles.content}>
            {activeTab === 'active' ? (
              <FlatList
                data={activeFriends}
                keyExtractor={(item) => item.friend_id}
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center' }}
                renderItem={({ item }) => (
                  <FriendCard
                      full_name = {item.full_name}
                      location = {item.location_name}
                      start_time = {item.start_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No active friends yet</Text>
                }
              />
            ) : ( activeTab === 'all' ? (
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.friend_id}
                  style={{ width: '100%' }}
                  contentContainerStyle={{ alignItems: 'center' }}
                  renderItem={({ item }) => (
                    <FriendCard
                      full_name = {item.full_name}
                      location = {item.location_name}
                      start_time = {item.start_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No friends added yet </Text>
                  }
                />
              ) : (
              <FlatList
                data={friendRequests}
                keyExtractor={(item) => item.friend_id}
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center' }}
                renderItem={({ item }) => (
                  <View style={styles.resultItem}>
                    <View style={styles.userInfo}>
                      <Text style={styles.fullNameText}>{item.full_name}</Text>
                      <Text style={styles.usernameText}>@{item.username}</Text>
                    </View>
                    <Pressable 
                      style={styles.addButton}
                      onPress={() => handleAcceptRequest(item.friend_id)}
                    >
                      <Text style={styles.addButtonText}>Accept</Text>
                    </Pressable>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No friend requests </Text>
                }
              />
              )
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 7,
    paddingVertical: 5,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, 
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#717171',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#E2E2E2',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 5,
    borderBottomColor: '#1EA1FF',
    marginBottom: -5
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Rethink Sans",
    fontWeight: '500',
    color: '#000000',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  userInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  fullNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  usernameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
