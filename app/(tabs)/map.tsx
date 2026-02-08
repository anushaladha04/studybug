import { LocationUser, StudyMap } from '@/components/map';
import { Colors } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Mock data - in a real app, this would come from Supabase
const MOCK_USERS: LocationUser[] = [
  {
    id: '1',
    name: 'Alex',
    studying: 'React Native',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: '2',
    name: 'Jordan',
    studying: 'TypeScript',
    latitude: 37.7849,
    longitude: -122.4094,
  },
  {
    id: '3',
    name: 'Casey',
    studying: 'Mapbox',
    latitude: 37.7649,
    longitude: -122.4294,
  },
];

export default function MapScreen() {
  const [selectedUser, setSelectedUser] = useState<LocationUser | null>(null);
  const [users, setUsers] = useState<LocationUser[]>(MOCK_USERS);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  // In a real app, you would fetch users from Supabase periodically
  useEffect(() => {
    // const interval = setInterval(() => {
    //   fetchUsersFromSupabase();
    // }, 5000); // Update every 5 seconds
    // return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StudyMap
        users={users}
        onUserPress={setSelectedUser}
        showUserLocation
      />

      {/* User Info Modal */}
      {selectedUser && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: Colors[theme].background,
                borderColor: Colors[theme].tint,
              },
            ]}>
            <Text style={styles.modalTitle}>
              {selectedUser.name}
            </Text>
            <Text style={styles.modalStudying}>
              📚 Studying: {selectedUser.studying}
            </Text>
            <Text style={styles.modalLocation}>
              📍 {selectedUser.latitude.toFixed(4)}, {selectedUser.longitude.toFixed(4)}
            </Text>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors[theme].tint },
              ]}
              onPress={() => setSelectedUser(null)}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    borderTopWidth: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  modalStudying: {
    marginBottom: 8,
    fontSize: 14,
    color: '#000',
  },
  modalLocation: {
    marginBottom: 16,
    fontSize: 12,
    opacity: 0.7,
    color: '#000',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
