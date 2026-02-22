import { isMapboxEnabled } from '@/lib/mapbox-config';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

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
  userLocation?: { latitude: number; longitude: number } | null;
}

// Default location (Los Angeles) - works well for testing
const DEFAULT_LOCATION = {
  latitude: 34.0522,
  longitude: -118.2437,
};

export function StudyMap({
  users = [],
  onUserPress,
  showUserLocation = true,
  userLocation,
}: StudyMapProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const mapboxEnabled = isMapboxEnabled() && MapboxGL !== null;
  const cameraRef = React.useRef<any>(null);
  const [zoomLevel, setZoomLevel] = React.useState(14);
  const hasCenteredOnUserRef = React.useRef(false);

  // Use user location if available, otherwise fall back to default
  const centerLocation = userLocation || DEFAULT_LOCATION;

  React.useEffect(() => {
    if (!userLocation || !cameraRef.current || hasCenteredOnUserRef.current) {
      return;
    }

    hasCenteredOnUserRef.current = true;
    cameraRef.current.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 14,
      animationDuration: 0,
    });
  }, [userLocation]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1, 20);
    setZoomLevel(newZoom);
    // Get current center from camera and zoom in
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1, 0);
    setZoomLevel(newZoom);
    // Get current center from camera and zoom out
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
      setZoomLevel(14);
    }
  };

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
        }
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        logoEnabled={true}
        attributionEnabled={true}>
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [centerLocation.longitude, centerLocation.latitude],
            zoomLevel: 14,
          }}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* User's location - use Mapbox's built-in UserLocation for better accuracy */}
        {showUserLocation && userLocation && (
          <MapboxGL.UserLocation
            visible={true}
            animated={true}
            showsUserHeadingIndicator={true}
            androidRenderMode="gps"
          />
        )}

        {/* Fallback user marker if UserLocation not available */}
        {showUserLocation && !userLocation && (
          <MapboxGL.PointAnnotation
            id="user-location"
            coordinate={[centerLocation.longitude, centerLocation.latitude]}>
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

      {/* Mapbox indicator badge */}
      <View style={styles.mapboxBadge}>
        <Text style={styles.mapboxBadgeText}>🗺️ Mapbox</Text>
      </View>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
        {userLocation && (
          <TouchableOpacity
            style={[styles.zoomButton, styles.centerButton]}
            onPress={handleCenterOnUser}>
            <Text style={styles.zoomButtonText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>
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
  // Mapbox indicator badge
  mapboxBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  mapboxBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Zoom controls
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  centerButton: {
    borderBottomWidth: 0,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});

