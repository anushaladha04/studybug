import EmptyHeart from '@/assets/icons/empty-heart.svg';
import FilledHeart from '@/assets/icons/filled-heart.svg';
import { likePost } from '@/controllers/post-interactions';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';


interface SessionPostProps {
    id: string,
    pfp: string,
    name: string,
    time: string,
    title: string,
    location: string,
    totalTime: number,
    image: string,
    likeCount: number,
    isLiked: boolean
}

export default function SessionPost({
    id,
    pfp,
    name,
    time,
    title,
    location,
    totalTime,
    image,
    likeCount,
    isLiked
}: SessionPostProps) {
    const [ numLikes, setNumLikes ] = useState(likeCount);
    const [ likeStatus, setLikeStatus ] = useState(isLiked);
    
    const router = useRouter();
    const SUPABASE_URL = 'https://eabnnwzgebqtarbubyat.supabase.co';

    const getPublicUrl = (bucket: string, path: string) => {
        if (!path) 
            return 'default_avatar_url_here';
        return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    };

    const formatPostedTime = () => {
        const postedTime = new Date(time);

        const formatter = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
            timeStyle: 'short',
        });

        return formatter.format(postedTime);
            
    };

    const formattedDuration = () => {
        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime - hours * 3600) / 60);

        if (hours == 0)
            return `${minutes} min`

        if (minutes == 0)
            return `${hours} hr`

        return `${hours} hr ${minutes} min`;
    }

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

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <ExpoImage
                    style={styles.avatar}
                    source={getPublicUrl('profile_pictures', pfp)}
                    placeholder={require('@/assets/images/profile-icon.png')}
                    contentFit="cover"
                    placeholderContentFit="cover"
                    transition={500}
                    cachePolicy="memory-disk"
                />
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{formatPostedTime()} </Text>
                </View>
            </View>

            <Pressable 
                onPress={() => router.push({
                    pathname: '/session-posting-details',
                    params: {
                        id,
                        pfp,
                        name,
                        title,
                        location,
                        postedTime: formatPostedTime(),
                        duration: formattedDuration(),
                        image,
                        likeCount,
                        isLiked: isLiked.toString()
                    }
                })}
            >
                <View style={styles.infoRow}>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.location}>{location} </Text>
                    </View>
                    <View style={styles.totalTimeBlock}>
                        <Text style={styles.totalTimeLabel}>Total Time</Text>
                        <Text style={styles.totalTimeValue}>{formattedDuration()}</Text>
                    </View>
                </View>
            </Pressable>

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
                <Pressable onPress={handleLike}>
                    { likeStatus ?  <FilledHeart /> : <EmptyHeart /> }
                    
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
      card: {
        backgroundColor: '#fff',
        paddingHorizontal: 29,
        paddingVertical: 19,
        marginTop: 2,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderColor: '#dedede',
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