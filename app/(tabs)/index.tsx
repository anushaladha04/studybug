import SessionPost from '@/components/session-component';
import { fetchPostsRandomOrder } from '@/controllers/feed';
import { useAuthContext } from '@/hooks/use-auth-context';

import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { session } = useAuthContext();

  const [ posts, setPosts ] = useState<any>([]);
  const [ seed, setSeed ] = useState(Math.random());

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await fetchPostsRandomOrder(seed);        
        setPosts(data); 
      } catch (error) {
        console.error(error);
      }
    };

    fetchFeed();
  }, [seed]);

  return (
    <View style={styles.container}>
      <FlatList
          data={posts}
          keyExtractor={(item) => item.session_id}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <SessionPost
                name = {item.full_name}
                time = {item.end_time}
                title = {item.name}
                location = {item.location_name}
                totalTime = {item.duration}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.subtitle}>No posts yet</Text>
          }
        />
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    marginBottom: 16,
  },
});


