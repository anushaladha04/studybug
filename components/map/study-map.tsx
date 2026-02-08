import { isMapboxEnabled } from '@/lib/mapbox-config';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

// Try to import Mapbox - will fail gracefully in Expo Go
let MapboxGL: any = null;
try {
  // Only attempt to load if Mapbox should be enabled
  if (isMapboxEnabled()) {
    MapboxGL = require('@rnmapbox/maps').default;
    // Set Mapbox access token
    const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoia3Vrc3RlcjkzIiwiYSI6ImNta3VkZjhhdjF5MnAzZHBzd3o5amFkOWQifQ.u0dyXONcMJbWcG5F_e1uvw';
    MapboxGL.setAccessToken(token);
  }
} catch (error) {
  // Mapbox not available (e.g., in Expo Go or not installed)
  // This is expected when running in Expo Go
  MapboxGL = null;
}

export interface LocationUser {
  id: string;
  name: string;
  studying: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface StudyMapProps {
  users?: LocationUser[];
  onUserPress?: (user: LocationUser) => void;
  showUserLocation?: boolean;
}

// Default location (San Francisco) - works well for testing
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
};

export function StudyMap({
  users = [],
  onUserPress,
  showUserLocation = true,
}: StudyMapProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const mapboxEnabled = isMapboxEnabled() && MapboxGL !== null;

  // Fallback UI when Mapbox is disabled (e.g., in Expo Go)
  if (!mapboxEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>
            🗺️ Map View
          </Text>
          <Text style={styles.fallbackMessage}>
            Mapbox doesn't work with Expo Go. Use a development build to see the interactive map.
          </Text>
        </View>
      </View>
    );
  }

  // Mapbox-enabled view
  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={
          theme === 'dark'
            ? MapboxGL.StyleURL.Dark
            : MapboxGL.StyleURL.Street
        }>
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: [DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.latitude],
            zoomLevel: 12,
          }}
        />

        {/* User's location marker */}
        {showUserLocation && (
          <MapboxGL.PointAnnotation
            id="user-location"
            coordinate={[DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.latitude]}>
            <View style={styles.userMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {/* Other users' markers */}
        {users.map((user) => (
          <MapboxGL.PointAnnotation
            key={user.id}
            id={user.id}
            coordinate={[user.longitude, user.latitude]}
            onSelected={() => onUserPress?.(user)}>
            <View style={styles.userPin}>
              <View style={styles.pinDot} />
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  // Fallback styles
  fallbackContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  fallbackMessage: {
    textAlign: 'center',
    opacity: 0.7,
    color: '#000',
  },
});
