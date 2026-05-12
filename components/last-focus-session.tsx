import ClockIcon from '@/assets/icons/clock.svg';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface StudySessionProps {
  date: string;
  totalTime: string;
  location: string;
  topic: string;
  note: string;
}

export default function LastFocusSession({ date, totalTime, location, topic, note }: StudySessionProps) {
  const formatDuration = (timeStr: string) => {
  const [hh, mm, ss] = timeStr.split(':').map(Number);

  if (hh > 0) {
    return `${hh} hr ${mm} min`;
  } else if (mm == 0) {
    return `${ss} sec`;
  }
  return `${mm} min ${ss} sec`;
  };

  const { profile, profileImageVersion } = useAuthContext();

  const imagePath = profile?.profile_image_path ?? 'avatar_4.jpg';
  const { data: { publicUrl } } = supabase.storage
    .from('profile_pictures')
    .getPublicUrl(imagePath);
  const avatarUrl = `${publicUrl}?v=${profileImageVersion}`;


  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Text style={styles.nameText}>{date}</Text>
        <Text style={styles.detailText}>Location: {location}</Text>
        <Text style={styles.detailText}>Note: {note}</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.timeContainer}>
          <ClockIcon />
          <Text style={styles.metricText}>{formatDuration(totalTime)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    gap: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    height: 76,
    width: '90%',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Rethink Sans',
    color: '#000',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Rethink Sans',
    color: '#000',
  },
  metricsContainer: {
    position: 'absolute',
    bottom: 9,
    right: 14,
    alignItems: 'flex-end',
  },
  metricText: {
    fontSize: 12,
    color: '#555',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});