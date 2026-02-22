import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.headerRow}>
        <Pressable onPress={() => { /*TODO: Add friend flow */ }}>
          <Ionicons name="person-add-outline" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={() => { /* TODO: Notifications flow */ }}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </Pressable>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search friends..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
                renderItem={({ item }) => (
                  <FriendCard
                      full_name = {item.full_name}
                      location = {item.location_name}
                      start_time = {item.start_time}
                      is_active = {item.is_active}
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
                  renderItem={({ item }) => (
                    <FriendCard
                      full_name = {item.full_name}
                      location = {item.location_name}
                      start_time = {item.start_time}
                      is_active = {item.is_active}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  searchBar: {
    width: '90%',
    height: 42,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginTop: 16,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0a7ea4',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    width: '100%',
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
