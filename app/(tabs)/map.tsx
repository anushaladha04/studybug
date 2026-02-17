import { LocationUser, StudyMap } from '@/components/map';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  // Get user's location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          // Don't show alert on first load, just silently fail
          // The map will use default location
          return;
        }

        // Check if location services are enabled
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          setLocationError('Location services are disabled');
          // Map will use default location
          return;
        }

        // Get current location with timeout - try multiple accuracy levels
        try {
          let location: Location.LocationObject | null = null;
          
          // Try with different accuracy levels, starting with less accurate (faster)
          const accuracyLevels = [
            Location.Accuracy.Low,
            Location.Accuracy.Balanced,
            Location.Accuracy.High,
          ];
          
          for (const accuracy of accuracyLevels) {
            try {
              location = await Promise.race([
                Location.getCurrentPositionAsync({
                  accuracy: accuracy,
                }),
                new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error('Location timeout')), 8000)
                ),
              ]);
              break; // Success, exit loop
            } catch (err) {
              // Try next accuracy level
              console.log(`Location request failed with accuracy ${accuracy}, trying next...`);
              continue;
            }
          }
          
          if (!location) {
            throw new Error('All location accuracy attempts failed');
          }
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setLocationError(null);
          console.log('Location obtained:', location.coords.latitude, location.coords.longitude);

          // Watch location updates (only if we got initial location)
          try {
            subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Low, // Use lower accuracy for watching to save battery
                timeInterval: 5000, // Update every 5 seconds
                distanceInterval: 10, // Update every 10 meters
              },
              (location) => {
                setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
                setLocationError(null);
                console.log('Location updated:', location.coords.latitude, location.coords.longitude);
              }
            );
          } catch (watchError) {
            // If watching fails, that's okay - we still have the initial location
            console.log('Location watching not available:', watchError);
          }
        } catch (locationError: any) {
          // Handle specific location errors
          if (locationError.message?.includes('timeout') || 
              locationError.message?.includes('unavailable') ||
              locationError.code === 'E_LOCATION_UNAVAILABLE') {
            setLocationError('Location services unavailable. Using default location.');
            // This is common on emulators - just use default location
          } else {
            setLocationError('Failed to get location');
            console.error('Error getting location:', locationError);
          }
        }
      } catch (error: any) {
        console.error('Error in location setup:', error);
        setLocationError('Location unavailable');
        // Map will use default location
      }
    })();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

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
        userLocation={userLocation}
      />

      {/* Location status indicator */}
      {locationError && (
        <View style={styles.locationStatus}>
          <Text style={styles.locationStatusText}>
            {locationError.includes('permission') 
              ? '📍 Location permission needed'
              : locationError.includes('services')
              ? '📍 Enable location services'
              : '📍 Using default location'}
          </Text>
        </View>
      )}

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
  locationStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    maxWidth: '70%',
  },
  locationStatusText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
  },
});
