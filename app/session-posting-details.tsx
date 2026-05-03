import BackArrow from '@/assets/icons/back-arrow.svg';
import EmptyHeart from '@/assets/icons/empty-heart.svg';
import FilledHeart from '@/assets/icons/filled-heart.svg';
import CommentBar from '@/components/comment-bar';
import { CommentItem } from '@/components/comment-component';
import { commentOnPost, fetchComments, likePost } from '@/controllers/post-interactions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


interface SessionPostDetailsProps {
  name: string;
  time: string;
  title: string;
  location: string;
  totalTime: number;
  image: string
}

export default function SessionPostDetailsScreen() {

  const router = useRouter();
  const SUPABASE_URL = 'https://eabnnwzgebqtarbubyat.supabase.co';

  const getPublicUrl = (bucket: string, path: string) => {
      if (!path) 
          return 'default_avatar_url_here';
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  };

  const { id, pfp, name, title, location, postedTime, duration, image, likeCount, isLiked, focusKeyboard } = useLocalSearchParams<{
    id: string,
    pfp: string,
    name: string;
    title: string;
    location: string;
    postedTime: string;
    duration: string;
    image: string;
    likeCount: string,
    isLiked: string,
    focusKeyboard: string
  }>();

  const [ numLikes, setNumLikes ] = useState(Number(likeCount));
  const [ likeStatus, setLikeStatus ] = useState(isLiked === 'true');
  const [ commentText, setCommentText ] = useState('');
  const [ comments, setComments ] = useState<any[]>([]);
  const [ isLoadingComments, setIsLoadingComments ] = useState(true);
  const [ isPostingNewComment, setIsPostingNewComment ] = useState(false);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await fetchComments(id);
            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingComments(false);
        }
    }
    loadData();
  }, [id]);

  const handleLike = async () => {
      const previousState = likeStatus;
      const previousCount = numLikes;

      setLikeStatus(!previousState);
      setNumLikes(previousState ? previousCount - 1 : previousCount + 1);

      try {
          await likePost(id);
      } catch (err) {
          setLikeStatus(previousState);
          setNumLikes(previousCount);
      }
  }

  const handleComment = async () => {
    if (!commentText.trim() || isPostingNewComment) return;

    const savedText = commentText; // Save it in case of error
    setCommentText('');            // Clear input immediately for UX
    setIsPostingNewComment(true);         // Start loading spinner

    try {
      const newComment = await commentOnPost(id, savedText);
      setComments((prev) => [newComment, ...prev]);
    } catch (err) {
      // If it fails, put the text back so they don't lose it
      setCommentText(savedText);
      alert("Couldn't post comment. Please try again.");
    } finally {
      setIsPostingNewComment(false); // Stop loading spinner
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 52) return `${weeks}w`;
    
    return `${Math.floor(weeks / 52)}y`;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollPadding}>
          <View style={styles.headerContainer}>
            <Pressable
                style={styles.backButtonContainer}
                onPress={() => router.back()} 
                hitSlop={20}
            >
                <BackArrow />
            </Pressable>
            <Text style={styles.headerTitle}>Study Session</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Image 
                  source={{ uri: getPublicUrl('profile_pictures', pfp) }} 
                  style={styles.avatar}
                  resizeMode="cover"
              />
              <View>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.time}>{postedTime} </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.location}>{location} </Text>
              </View>
              <View style={styles.totalTimeBlock}>
                  <Text style={styles.totalTimeLabel}>Total Time</Text>
                  <Text style={styles.totalTimeValue}>{duration}</Text>
              </View>
            </View>

            {image ? (
              <Image 
                  source={{ uri: getPublicUrl('session_pictures', image) }} 
                  style={styles.postImage}
                  resizeMode="cover"
              />
                ) : (
                    <View style={styles.chartPlaceholder} />
                )}

              <View style={styles.actions}>
                  <Pressable onPress={handleLike} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    { likeStatus ?  <FilledHeart /> : <EmptyHeart /> }
                    <Text style={{ marginLeft: 5 }}>{numLikes}</Text>
                  </Pressable>
              </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments</Text>
            
            {isLoadingComments ? (
              <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>No comments yet. Be the first!</Text>
            ) : (
              comments.map((item) => (
                <CommentItem 
                  key={item.id}
                  username={item.profiles?.username || 'User'}
                  avatarUrl={getPublicUrl('profile_pictures', item.profiles?.profile_image_path)}
                  comment={item.comment}
                  date={formatRelativeTime(item.commented_at)}
                />
              ))
            )}
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <CommentBar 
            value={commentText} 
            onChangeText={setCommentText} 
            onSend={handleComment}
            isLoading={isPostingNewComment}
            disabled={isPostingNewComment || !commentText.trim()}
            autoFocus={focusKeyboard === 'true'}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 13,
    // alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 29,
    paddingVertical: 19,
    marginTop: 2,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#dedede',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      marginRight: 15,
  },
  name: {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Rethink Sans',
      color: '#000',
  },
  time: {
      fontSize: 15,
      color: '#888',
      marginTop: 2,
  },
  backAvatar: {
    backgroundColor: '#9A9A9A',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  content: {
    // flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dedede',
    borderStyle: 'solid',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Rethink Sans',
      color: '#000',
  },
  location: {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Rethink Sans',
      color: '#000'
  },
  totalTimeBlock: {
      alignItems: 'flex-end',
  },
  totalTimeLabel: {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Rethink Sans',
      color: '#000'
  },
  totalTimeValue: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Rethink Sans',
      color: '#000',
  },
  postImage: {
      width: '100%',
      paddingVertical: 20,
      aspectRatio: 3/2,
      borderRadius: 8,
  },
  chartPlaceholder: {
      height: 150,
      backgroundColor: '#f2f2f2',
      borderRadius: 7,
      marginTop: 10,
  },
  actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 20,
      marginTop: 12,
  },
  icon: {
      fontSize: 24,
      color: '#444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Rethink Sans',
    marginBottom: 15,
    color: '#000',
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commentItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Rethink Sans',
    color: '#333',
  },
  commentDate: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  scrollPadding: {
    paddingBottom: 120, // Enough space so the last comment isn't hidden by the CommentBar
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rethink Sans',
  },
  noComments: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontFamily: 'Rethink Sans',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff', // Or transparent if you want
    paddingBottom: 30,       // Crucial for "Home Indicator" spacing on iPhone
    paddingTop: 10,
    alignItems: 'center',
  },
  
});
