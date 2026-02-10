import { fetchByUsername, requestFriend } from '@/controllers/friends';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'requests'>('active');

  const [ searchQuery, setSearchQuery ] = useState('');
  const [ searchResults, setSearchResults ] = useState<any[]>([]);

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

  const isSearching = searchQuery.length > 0;

  const handleRequest = async (to: string, username: string) => {
    try {
      await requestFriend(to);
      Alert.alert(`Alert sent to ${username}`)
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>

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
              <Text style={styles.emptyText}>No active friends right now</Text>
            ) : ( activeTab === 'all' ? (
                <Text style={styles.emptyText}>No friends added yet</Text>
              ) : (
                <Text style={styles.emptyText}>No requests yet</Text>
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
