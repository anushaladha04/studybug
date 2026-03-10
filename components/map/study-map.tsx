import { isMapboxEnabled } from '@/lib/mapbox-config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

let MapboxGL: any = null;
try {
  if (isMapboxEnabled()) {
    MapboxGL = require('@rnmapbox/maps').default;
    const token =
      process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      'pk.eyJ1Ijoia3Vrc3RlcjkzIiwiYSI6ImNta3VkZjhhdjF5MnAzZHBzd3o5amFkOWQifQ.u0dyXONcMJbWcG5F_e1uvw';
    MapboxGL.setAccessToken(token);
  }
} catch {
  MapboxGL = null;
}

export interface LocationUser {
  id: string;
  name: string;
  studying: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  imageUrl?: string;
  pinColor?: string;
}

interface StudyMapProps {
  users?: LocationUser[];
  onUserPress?: (user: LocationUser) => void;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  showMapboxBadge?: boolean;
  showZoomControls?: boolean;
  showRecenterControl?: boolean;
  recenterTrigger?: number;
  showMarkerLabels?: boolean;
}

const DEFAULT_LOCATION = {
  latitude: 34.0522,
  longitude: -118.2437,
};

export function StudyMap({
  users = [],
  onUserPress,
  showUserLocation = true,
  userLocation,
  showMapboxBadge = true,
  showZoomControls = true,
  showRecenterControl = true,
  recenterTrigger = 0,
  showMarkerLabels = true,
}: StudyMapProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const mapboxEnabled = isMapboxEnabled() && MapboxGL !== null;
  const cameraRef = React.useRef<any>(null);
  const [zoomLevel, setZoomLevel] = React.useState(14);
  const hasCenteredOnUserRef = React.useRef(false);

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

  const lastRecenterTriggerRef = React.useRef(recenterTrigger);

  React.useEffect(() => {
    if (recenterTrigger === lastRecenterTriggerRef.current) {
      return;
    }

    lastRecenterTriggerRef.current = recenterTrigger;
    handleCenterOnUser();
  }, [recenterTrigger, userLocation]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1, 20);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1, 0);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
  };

  const handleCenterOnUser = () => {
    if (!userLocation) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 14,
      animationDuration: 700,
    });
    setZoomLevel(14);
  };

  const getPinLabel = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Friend';
    const firstName = trimmed.split(/\s+/)[0];
    if (zoomLevel < 12) return firstName.slice(0, 1).toUpperCase();
    if (zoomLevel < 14) return firstName;
    return trimmed;
  };

  if (!mapboxEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackMap}>
          <View style={styles.roadHorizontal} />
          <View style={[styles.roadVertical, { left: '22%' }]} />
          <View style={[styles.roadVertical, { left: '52%', height: '88%', top: '-4%', transform: [{ rotate: '12deg' }] }]} />
          <View style={[styles.roadDiagonal, { top: '28%' }]} />
          <View style={[styles.roadDiagonal, { top: '62%' }]} />
          {users.slice(0, 4).map((user, index) => (
            <View
              key={user.id}
              style={[
                styles.fallbackPin,
                {
                  top: `${22 + index * 14}%`,
                  left: `${18 + (index % 3) * 26}%`,
                  borderColor: user.pinColor ?? '#ea9a9a',
                },
              ]}>
              <View style={styles.fallbackPinInner} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const compactLabel = zoomLevel < 12;

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        onCameraChanged={(event: any) => {
          const nextZoom = event?.properties?.zoom;
          if (typeof nextZoom === 'number' && Number.isFinite(nextZoom)) {
            setZoomLevel(nextZoom);
          }
        }}
        styleURL={theme === 'dark' ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
        logoEnabled={showMapboxBadge}
        attributionEnabled={showMapboxBadge}>
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [centerLocation.longitude, centerLocation.latitude],
            zoomLevel: 14,
          }}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {showUserLocation && (
          <MapboxGL.PointAnnotation
            id="user-location"
            coordinate={[
              (userLocation ?? centerLocation).longitude,
              (userLocation ?? centerLocation).latitude,
            ]}>
            <View collapsable={false} style={styles.userMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {users.map((user) => (
          <MapboxGL.PointAnnotation
            key={user.id}
            id={user.id}
            coordinate={[user.longitude, user.latitude]}
            onSelected={() => onUserPress?.(user)}>
            <View collapsable={false} style={styles.pinMarkerWrap}>
              {showMarkerLabels && (
                <View collapsable={false} style={[styles.pinLabel, compactLabel && styles.pinLabelCompact]}>
                  <Text numberOfLines={1} style={styles.pinLabelText}>
                    {getPinLabel(user.name)}
                  </Text>
                </View>
              )}
              <View
                collapsable={false}
                style={[styles.userPin, user.pinColor ? { backgroundColor: user.pinColor } : null]}>
                <View collapsable={false} style={styles.pinDot} />
              </View>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {showMapboxBadge && (
        <View style={styles.mapboxBadge}>
          <Text style={styles.mapboxBadgeText}>Mapbox</Text>
        </View>
      )}

      {showZoomControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      )}

      {showRecenterControl && userLocation && (
        <TouchableOpacity
          style={[
            styles.recenterButton,
            showZoomControls ? styles.recenterButtonWithZoomControls : null,
          ]}
          onPress={handleCenterOnUser}>
          <Ionicons name="navigate" size={18} color="#1d1d1f" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  userMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7da6f8',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ea9a9a',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinMarkerWrap: {
    alignItems: 'center',
    minWidth: 36,
  },
  pinLabel: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    maxWidth: 96,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  pinLabelCompact: {
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 2,
    maxWidth: 28,
  },
  pinLabelText: {
    color: '#111',
    fontSize: 10,
    fontWeight: '600',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e7e7e7',
  },
  fallbackMap: {
    flex: 1,
    backgroundColor: '#dfdfdf',
    overflow: 'hidden',
  },
  roadHorizontal: {
    position: 'absolute',
    top: '44%',
    left: '-10%',
    width: '120%',
    height: 18,
    backgroundColor: '#d0d0d0',
    transform: [{ rotate: '8deg' }],
  },
  roadVertical: {
    position: 'absolute',
    top: '-10%',
    width: 12,
    height: '120%',
    backgroundColor: '#ececec',
    transform: [{ rotate: '8deg' }],
  },
  roadDiagonal: {
    position: 'absolute',
    left: '-10%',
    width: '130%',
    height: 8,
    backgroundColor: '#efefef',
    transform: [{ rotate: '-18deg' }],
  },
  fallbackPin: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 4,
    backgroundColor: '#d9d9d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackPinInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ececec',
  },
  mapboxBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  recenterButton: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  recenterButtonWithZoomControls: {
    bottom: 118,
  },
});
