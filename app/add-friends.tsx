import AvatarIcon from '@/assets/icons/avatar';
import BackArrow from '@/assets/icons/back-arrow.svg';
import RightArrow from '@/assets/icons/right-arrow';

import SearchBar from '@/components/search-bar';
import SearchResultItem from '@/components/search-result-item';
import { acceptFriendRequest, fetchByUsernameWithFriendshipStatus, requestFriend } from '@/controllers/friends';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AddFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ searchResults, setSearchResults ] = useState<any[]>([]);

  const router = useRouter();

  const isSearching = searchQuery.length > 0;

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRequest = async (to: string) => {
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

  const handleAcceptRequest = async (from: string) => {
    try {
      await acceptFriendRequest(from);
      setSearchResults(prev => 
        prev.map(user => 
          user.id === from ? { ...user, friendship_status: 'friends' } : user
        )
      );
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
        <Text style={styles.headerTitle}>Add Friends</Text>
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={clearSearch}
        placeholder={'Find friends'}
      />
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
                <SearchResultItem 
                  item={item}
                  onFollow={handleRequest}
                  onAccept={handleAcceptRequest}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found </Text>
                </View>
              }
            />
          </>
        ) : (
          <Pressable style={
            styles.requestContainer} 
            onPress={() => router.push('/friend-requests')}
          >
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, styles.backAvatar]} />
              <AvatarIcon width={38} height={38} top={12} left={18} zIndex={2}/>
            </View>

            <Text style={styles.requestText}>Friend Requests</Text>
            <RightArrow />
          </Pressable>
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
  backButtonContainer: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  requestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 23,
    marginTop: 30,
    backgroundColor: '#fff',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 15,
    width: 60,
    height: 50,
    position: 'relative'
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  backAvatar: {
    backgroundColor: '#9A9A9A',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  requestText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rethink Sans',
    fontWeight: '400',
    color: '#000',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
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
