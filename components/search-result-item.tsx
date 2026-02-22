import AvatarIcon from '@/assets/icons/avatar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SearchResultItemProps {
  item: {
    id: string;
    full_name: string;
    username: string;
    friendship_status: 'none' | 'requested' | 'pending_approval' | 'friends';
  };
  onFollow: (id: string) => void;
  onAccept: (id: string) => void;
}

export default function SearchResultItem({ item, onFollow, onAccept }: SearchResultItemProps) {
  return (
    <View style={styles.resultItem}>
        <AvatarIcon />
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
                onFollow(item.id);
            } else if (item.friendship_status === 'pending_approval') {
                onAccept(item.id);
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
  );
};

const styles = StyleSheet.create({
  resultItem: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 6,
    gap: 19,
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