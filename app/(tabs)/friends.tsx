import AddFriend from '@/assets/icons/add-friend.svg';
import FriendCard from '@/components/friend-card';
import SearchBar from '@/components/search-bar';
import { fetchAllFriends } from '@/controllers/friends';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  const [ searchQuery, setSearchQuery ] = useState('');
  const [ searchResults, setSearchResults ] = useState<any[]>([]);
  const [ friends, setFriends ] = useState<any[]>([]);
  
  const router = useRouter();

  const isSearching = searchQuery.length > 0;

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const fetchFriends = async () => {
      try {
        const data = await fetchAllFriends();
        setFriends(data); 
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(friends);
      return;
    }

    const results = friends.filter(friend =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  }, [searchQuery, friends]);

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  const activeFriends = friends.filter(friend => friend.is_active === true);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Friends</Text>
        <Pressable 
          style={styles.addFriendContainer} 
          onPress={() => router.push('/add-friends')}
        >
          <AddFriend />
        </Pressable>
      </View>
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={clearSearch}
        placeholder={'Search friends'}
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
              keyExtractor={(item) => item.friend_id}
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center'}}
              renderItem={({ item }) => (
                <FriendCard
                  full_name = {item.full_name}
                  location = {item.location_name}
                  start_time = {item.start_time}
                  end_time = {item.end_time}
                  is_active = {item.is_active}
                  note = {item.note}
                />
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
                      end_time = {item.end_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No active friends yet</Text>
                }
              />
            ) : (
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
                      end_time = {item.end_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No friends added yet </Text>
                  }
                />
              )
            }
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
  addFriendContainer: {
    position: 'absolute',
    right: 20,
    padding: 5,
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
});