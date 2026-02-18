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
    let isMounted = true;

    const applyLocation = (location: Location.LocationObject | Location.LocationObjectCoords, source: string) => {
      const coords = 'coords' in location ? location.coords : location;
      if (!isMounted) {
        return;
      }

      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setLocationError(null);
      console.log(`Location set from ${source}:`, coords.latitude, coords.longitude);
    };
    
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

        // Fast path: use a recent cached position first so map centers immediately.
        try {
          const lastKnown = await Location.getLastKnownPositionAsync({
            maxAge: 120000,
            requiredAccuracy: 1000,
          });
          if (lastKnown) {
            applyLocation(lastKnown, 'lastKnown');
          }
        } catch (lastKnownError) {
          console.log('No last known location available:', lastKnownError);
        }

        // Start watching regardless; this can update quickly even if current lookup stalls.
        try {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 3000,
              distanceInterval: 5,
            },
            (location) => {
              applyLocation(location, 'watch');
            }
          );
        } catch (watchError) {
          console.log('Location watching not available:', watchError);
        }

        // Active lookup with short timeout to avoid long blocking delays.
        const getCurrentWithTimeout = (accuracy: Location.Accuracy, timeoutMs: number) =>
          Promise.race<Location.LocationObject>([
            Location.getCurrentPositionAsync({ accuracy }),
            new Promise<Location.LocationObject>((_, reject) =>
              setTimeout(() => reject(new Error('Location timeout')), timeoutMs)
            ),
          ]);

        try {
          const currentLocation = await getCurrentWithTimeout(Location.Accuracy.Balanced, 5000);
          applyLocation(currentLocation, 'current-balanced');
        } catch (balancedError) {
          console.log('Balanced location timed out, trying low accuracy...', balancedError);
          try {
            const fallbackLocation = await getCurrentWithTimeout(Location.Accuracy.Low, 3000);
            applyLocation(fallbackLocation, 'current-low');
          } catch (locationError: any) {
            if (
              locationError.message?.includes('timeout') ||
              locationError.message?.includes('unavailable') ||
              locationError.code === 'E_LOCATION_UNAVAILABLE'
            ) {
              setLocationError('Location services unavailable. Using default location.');
              // This is common on emulators - just use default location
            } else {
              setLocationError('Failed to get location');
              console.error('Error getting location:', locationError);
            }
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
      isMounted = false;
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
