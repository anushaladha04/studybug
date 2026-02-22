import SearchIcon from '@/assets/images/search.svg';
import FriendCard from '@/components/friend-card';
import { acceptFriendRequest, fetchAllFriends, fetchByUsernameWithFriendshipStatus, fetchFriendRequests, requestFriend } from '@/controllers/friends';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
      setSearchResults(prev => 
        prev.map(u => u.id === to ? { ...u, friendship_status: 'requested' } : u)
      );
    } catch (error) {
      console.error(error);
      setSearchResults(prev => 
        prev.map(u => u.id === to ? { ...u, friendship_status: 'none' } : u)
      );
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
      setSearchResults(prev => 
        prev.map(user => 
          user.id === from ? { ...user, friendship_status: 'friends' } : user
        )
      );
      setFriendRequests(prev => prev.filter(request => request.friend_id !== from));
      await fetchFriends();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const searchUsers = async (query: string) => {
      try {
        const data = await fetchByUsernameWithFriendshipStatus(query);        
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
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultText}>
              Showing results for "{searchQuery}"
              </Text>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center'}}
              renderItem={({ item }) => (
                <View style={styles.resultItem}>
                  <View style={styles.avatar}/>
                  <View style={styles.userInfo}>
                    <Text style={styles.fullNameText}>{item.full_name}</Text>
                    <Text style={styles.usernameText}>@{item.username}</Text>
                  </View>
                  <Pressable 
                    style={[
                      styles.addButton,
                      (item.friendship_status === 'friends' || item.friendship_status === 'requested') && styles.followingButton
                    ]}
                    onPress={() => {
                      if (item.friendship_status === 'none') {
                        handleRequest(item.id, item.username);
                      } else if (item.friendship_status === 'pending_approval') {
                        handleAcceptRequest(item.id);
                      }
                    }}
                  >
                    <Text style={styles.addButtonText}>
                      {item.friendship_status === 'none' && 'Follow'}
                      {item.friendship_status === 'requested' && 'Requested'}
                      {item.friendship_status === 'pending_approval' && 'Accept'}
                      {item.friendship_status === 'friends' && 'Following'}
                    </Text>
                </Pressable>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
            />
          </>
          ) : (
          <>
            {activeTab === 'active' ? (
              <FlatList
                data={activeFriends}
                keyExtractor={(item) => item.friend_id}
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}
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
                  contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}
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
                contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}
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
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 13,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Rethink Sans',
    fontWeight: 500,
    textAlign: 'center',
    marginTop: 50,
    paddingTop: 13,
    marginBottom: 13
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
    marginBottom: 14,
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
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  resultsHeader: {
    marginTop: 21,
    marginBottom: 16,
    paddingLeft: 16
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Rethink Sans',
    fontWeight: '400',
    color: '#000',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 35,
    backgroundColor: '#2a2f30',
    marginLeft: 5,
    marginRight: 20,
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
  addButton: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C9635',
    backgroundColor: 'rgba(174, 232, 71, 0.36)'
  },
  addButtonText: {
    color: '#000',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'Rethink Sans'
  },
  followingButton: {
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C9635',
    backgroundColor: 'rgba(28, 150, 53, 0.36)'
  }
});
