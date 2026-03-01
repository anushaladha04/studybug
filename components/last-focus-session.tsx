import { StyleSheet, Text, View } from 'react-native';

export interface StudySessionProps {
  date: string;
  totalTime: string;
  location: string;
  topic: string;
}

export default function LastFocusSession({ date, totalTime, location, topic }: StudySessionProps) {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.dateHeader}>{date}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Total Time: </Text>
        <Text style={styles.value}>{totalTime}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Location: </Text>
        <Text style={styles.value}>{location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Topic: </Text>
        <Text style={styles.value}>{topic}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 373,
    height: 108,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 23,
    paddingHorizontal: 35,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 500,
    fontFamily: 'Rethink Sans',
    color: '#000'
  },
  infoRow: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Rethink Sans',
    color: '#000', // Lighter grey for the label
  },
  value: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Rethink Sans',
    color: '#000',
  },
});