import { LocationUser, StudyMap } from '@/components/map';
import { fetchAllFriends } from '@/controllers/friends';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

type FriendRow = {
  friend_id: string;
  full_name?: string | null;
};

type ActiveStudySessionRow = {
  session_id: string;
  user_id: string;
  subject?: string | null;
  location_name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export default function MapScreen() {
  const [selectedUser, setSelectedUser] = useState<LocationUser | null>(null);
  const [users, setUsers] = useState<LocationUser[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  // Get user's location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;
    let retryInterval: ReturnType<typeof setInterval> | null = null;
    let isLocationLookupInFlight = false;

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
    };

    const getCurrentWithTimeout = (accuracy: Location.Accuracy, timeoutMs: number) =>
      Promise.race<Location.LocationObject>([
        Location.getCurrentPositionAsync({ accuracy }),
        new Promise<Location.LocationObject>((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), timeoutMs)
        ),
      ]);

    const attemptActiveLocationLookup = async () => {
      if (!isMounted || isLocationLookupInFlight) {
        return;
      }

      isLocationLookupInFlight = true;
      try {
        const currentLocation = await getCurrentWithTimeout(Location.Accuracy.Balanced, 15000);
        applyLocation(currentLocation, 'current-balanced');
      } catch (balancedError) {
        try {
          const fallbackLocation = await getCurrentWithTimeout(Location.Accuracy.Low, 8000);
          applyLocation(fallbackLocation, 'current-low');
        } catch (locationError: any) {
          if (
            locationError.message?.includes('timeout') ||
            locationError.message?.includes('unavailable') ||
            locationError.code === 'E_LOCATION_UNAVAILABLE'
          ) {
            if (isMounted) {
              setLocationError('Still trying to get your location...');
            }
          } else {
            if (isMounted) {
              setLocationError('Failed to get location');
            }
            console.error('Error getting location:', locationError);
          }
        }
      } finally {
        isLocationLookupInFlight = false;
      }
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
        } catch (_lastKnownError) {}

        // Start watching regardless; this can update quickly even if current lookup stalls.
        try {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 30000,
              distanceInterval: 25,
            },
            (location) => {
              applyLocation(location, 'watch');
            }
          );
        } catch (_watchError) {}

        await attemptActiveLocationLookup();

        // Keep retrying in case the emulator/provider is slow to produce an initial fix.
        retryInterval = setInterval(() => {
          void attemptActiveLocationLookup();
        }, 30000);
      } catch (error: any) {
        console.error('Error in location setup:', error);
        setLocationError('Location unavailable');
        // Map will use default location
      }
    })();

    // Cleanup
    return () => {
      isMounted = false;
      if (retryInterval) {
        clearInterval(retryInterval);
      }
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMapUsers = async () => {
      try {
        const friends = (await fetchAllFriends()) as FriendRow[];

        if (!isMounted) return;

        const friendIds = [...new Set(
          friends
            .map((friend) => friend.friend_id)
            .filter((id): id is string => Boolean(id))
        )];

        if (friendIds.length === 0) {
          setUsers([]);
          return;
        }

        const friendNameById = new Map(
          friends.map((friend) => [friend.friend_id, friend.full_name?.trim() || 'Friend'])
        );

        const { data, error } = await supabase
          .from('study_sessions')
          .select('session_id, user_id, subject, location_name, latitude, longitude')
          .in('user_id', friendIds)
          .eq('is_active', true)
          .eq('is_public', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          console.error('Error fetching active friend study sessions:', error.message);
          if (isMounted) setUsers([]);
          return;
        }

        const mappedUsers = ((data ?? []) as ActiveStudySessionRow[])
          .map((session): LocationUser | null => {
            const latitude = Number(session.latitude);
            const longitude = Number(session.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              return null;
            }

            const locationName = session.location_name?.trim();

            return {
              id: session.session_id,
              name: friendNameById.get(session.user_id) || 'Friend',
              studying: session.subject?.trim() || 'Studying',
              ...(locationName ? { locationName } : {}),
              latitude,
              longitude,
            } satisfies LocationUser;
          })
          .filter((value): value is LocationUser => value !== null);

        if (isMounted) {
          setUsers(mappedUsers);
          setSelectedUser((prev) =>
            prev ? mappedUsers.find((user) => user.id === prev.id) ?? null : null
          );
        }
      } catch (error) {
        console.error('Error loading map users:', error);
        if (isMounted) setUsers([]);
      }
    };

    void fetchMapUsers();
    const interval = setInterval(() => {
      void fetchMapUsers();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
              Location: {selectedUser.locationName ?? 'Unknown location'}
            </Text>
            {!selectedUser.locationName && (
            <Text style={styles.modalLocation}>
              📍 {selectedUser.latitude.toFixed(4)}, {selectedUser.longitude.toFixed(4)}
            </Text>
            )}

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
