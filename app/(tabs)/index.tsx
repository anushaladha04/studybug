import SessionPost from '@/components/session-component';
import { fetchPostsRandomOrder } from '@/controllers/feed';
import { useAuthContext } from '@/hooks/use-auth-context';

import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { session } = useAuthContext();

  const [ posts, setPosts ] = useState<any>([]);
  const [ seed, setSeed ] = useState(Math.random());
  const [ refreshing, setRefreshing ] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setSeed(Math.random());
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await fetchPostsRandomOrder(seed);

        setPosts(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchFeed();
  }, [seed]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Home Feed</Text>
      </View>
      <FlatList
          data={posts}
          keyExtractor={(item) => String(item.session_id)}
          style={{ width: '100%' }}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) =>  (
            <SessionPost
                name = {item.full_name}
                time = {item.end_time}
                title = {item.session_name}
                location = {item.location_name}
                totalTime = {item.duration}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet </Text>
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
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: 13
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
  listContent: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    marginBottom: 16,
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


