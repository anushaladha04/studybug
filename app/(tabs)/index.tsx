import SessionPost from '@/components/session-component';
import { fetchPostsRandomOrder } from '@/controllers/feed';
import { useAuthContext } from '@/hooks/use-auth-context';

import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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

  const fetchFeed = useCallback(async () => {
    try {
      const data = await fetchPostsRandomOrder(seed);
      const SUPABASE_BASE_URL = 'https://eabnnwzgebqtarbubyat.supabase.co/storage/v1/object/public/profile_pictures/';

      const pfpUrls = data
        .filter((item: any) => item.profile_image_path)
        .map((item: any) => `${SUPABASE_BASE_URL}${item.profile_image_path}`);
      Image.prefetch(pfpUrls);

      setPosts([...data]);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [seed]);

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [fetchFeed])
  );

  const handleLocalLikeUpdate = (sessionId: string, newIsLiked: boolean) => {
  setPosts((currentPosts: any) =>
    currentPosts.map((post: any) => {
      if (post.session_id === sessionId) {
        return {
          ...post,
          is_liked: newIsLiked,
          // If liked, add 1; if unliked, subtract 1
          like_count: newIsLiked ? post.like_count + 1 : post.like_count - 1,
        };
      }
      return post;
    })
  );
};

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Home Feed</Text>
      </View>
      <FlatList
          data={posts}
          extraData={posts}
          keyExtractor={(item) => String(item.session_id)}
          style={{ width: '100%' }}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) =>  (
              <SessionPost
                  key={`${item.session_id}`}
                  id = {item.session_id}
                  pfp = {item.profile_image_path}
                  name = {item.full_name}
                  time = {item.start_time}
                  title = {item.session_name}
                  location = {item.location_name}
                  totalTime = {item.duration}
                  image = {item.image_url}
                  likeCount={item.like_count}
                  isLiked={item.is_liked}
                  onLikeToggle={(newStatus) => handleLocalLikeUpdate(item.session_id, newStatus)}
              />
            )
          }
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


