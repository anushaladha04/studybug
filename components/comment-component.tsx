import { Image, StyleSheet, Text, View } from "react-native";

interface CommentItemProps {
  username: string;
  avatarUrl: string;
  comment: string;
  date: string;
}

export function CommentItem({ username, avatarUrl, comment, date }: CommentItemProps) {
    return (
    <View style={styles.container}>
      <Image 
        source={{ uri: avatarUrl || 'https://via.placeholder.com/40' }} 
        style={styles.avatar} 
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.commentText}>{comment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Keeps text aligned on the same baseline
    marginBottom: 2,
    justifyContent: 'flex-start', // Pushes them together
    gap: 5
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Rethink Sans',
    color: '#000',
  },
  date: {
    fontSize: 11,
    color: '#8e8e93',
    fontFamily: 'Rethink Sans',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Rethink Sans',
    lineHeight: 18,
  },
});