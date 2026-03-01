 import AddFriend from '@/assets/icons/add-friend.svg';
import FriendCard from '@/components/friend-card';
import SearchBar from '@/components/search-bar';
import { fetchAllFriends } from '@/controllers/friends';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);

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
      fetchUserLocation();
    }, [])
  );

  const fetchUserLocation = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
  
    if (status !== 'granted') {
      const response = await Location.requestForegroundPermissionsAsync();
      status = response.status;
    }

    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    console.log("Coordinates fetched!", location);

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const getDistanceMiles = (
    a: { latitude: number; longitude: number }, 
    b: { latitude: number; longitude: number }
  ) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 3958.8;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const sin2 =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  }

  const renderDistance = (friendLat: number, friendLon: number) => {
    if (!userLocation) return "Calculating...";

    if (friendLat === null || friendLon === null || friendLat === undefined) {
      return "No last location"; 
    }
    
    const miles = getDistanceMiles(
      userLocation, 
      { latitude: friendLat, longitude: friendLon }
    );
    
    return miles < 0.1 ? "< 0.1 mi" : `${miles.toFixed(1)} mi`;
  };

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
                  pfp = {item.profile_image_path}
                  full_name = {item.full_name}
                  location = {item.location_name}
                  distance = {renderDistance(item.latitude, item.longitude)}
                  start_time = {item.start_time}
                  end_time = {item.end_time}
                  is_active = {item.is_active}
                  note = {item.note}
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
          <>
            {activeTab === 'active' ? (
              <FlatList
                data={activeFriends}
                keyExtractor={(item) => item.friend_id}
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 16 }}
                renderItem={({ item }) => (
                  <FriendCard
                      pfp = {item.profile_image_path}
                      full_name = {item.full_name}
                      location = {item.location_name}
                      distance = {renderDistance(item.latitude, item.longitude)}
                      start_time = {item.start_time}
                      end_time = {item.end_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No active friends </Text>
                  </View>
                }
              />
            ) : (
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item.friend_id}
                  style={{ width: '100%' }}
                  contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingTop: 16 }}
                  renderItem={({ item }) => (
                    <FriendCard
                      pfp = {item.profile_image_path}
                      full_name = {item.full_name}
                      location = {item.location_name}
                      distance = {renderDistance(item.latitude, item.longitude)}
                      start_time = {item.start_time}
                      end_time = {item.end_time}
                      is_active = {item.is_active}
                      note = {item.note}
                  />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No friends added yet </Text>
                    </View>
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