import BackArrow from '@/assets/icons/back-arrow.svg';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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

  const { name, title, location, postedTime, duration, image } = useLocalSearchParams<{
    name: string;
    title: string;
    location: string;
    postedTime: string;
    duration: string;
    image: string;
  }>();

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
        <Text style={styles.headerTitle}>Study Session</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
                  <Image source={require('@/assets/images/profile-icon.png')} style={styles.avatar} />
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
              source={{ uri: image }} 
              style={styles.postImage}
              resizeMode="cover"
          />
            ) : (
                <View style={styles.chartPlaceholder} />
            )}

          <View style={styles.actions}>
              <Text style={styles.icon}>♡</Text>
          </View>
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
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
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
  
});
