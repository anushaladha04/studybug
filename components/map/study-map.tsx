import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { UserPin } from './user-pin';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export interface LocationUser {
  id: string;
  name: string;
  studying: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface StudyMapProps {
  users: LocationUser[];
  onUserPress?: (user: LocationUser) => void;
  showUserLocation?: boolean;
}

export function StudyMap({
  users,
  onUserPress,
  showUserLocation = true,
}: StudyMapProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useColorScheme() ?? 'light';
  const cameraRef = React.useRef<MapboxGL.Camera>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Center camera on user location when it's available
  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors[theme].background,
        }}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors[theme].background,
          padding: 16,
        }}>
        <Text style={{ color: Colors[theme].text, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors[theme].background,
        }}>
        <Text style={{ color: Colors[theme].text }}>Unable to get location</Text>
      </View>
    );
  }

  return (
    <MapboxGL.MapView
      style={{ flex: 1 }}
      styleURL={
        theme === 'dark'
          ? MapboxGL.StyleURL.Dark
          : MapboxGL.StyleURL.Light
      }>
      <MapboxGL.Camera
        ref={cameraRef}
        centerCoordinate={[userLocation.longitude, userLocation.latitude]}
        zoomLevel={14}
        animationMode="flyTo"
        animationDuration={1000}
      />

      {/* User's own location */}
      {showUserLocation && (
        <MapboxGL.PointAnnotation
          id="user-location"
          coordinate={[userLocation.longitude, userLocation.latitude]}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: Colors[theme].tint,
              borderWidth: 3,
              borderColor: '#fff',
            }}
          />
        </MapboxGL.PointAnnotation>
      )}

      {/* Other users' pins */}
      {users.map((user) => (
        <MapboxGL.PointAnnotation
          key={user.id}
          id={user.id}
          coordinate={[user.longitude, user.latitude]}
          onSelected={() => onUserPress?.(user)}>
          <UserPin user={user} />
        </MapboxGL.PointAnnotation>
      ))}
    </MapboxGL.MapView>
  );
}
