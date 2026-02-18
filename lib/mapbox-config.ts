import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Checks if Mapbox should be enabled in the current environment.
 * 
 * Mapbox is disabled when:
 * 1. Running in Expo Go (doesn't support native modules)
 * 2. EXPO_PUBLIC_ENABLE_MAPBOX is explicitly set to "false"
 * 
 * @returns true if Mapbox should be enabled, false otherwise
 */
export function isMapboxEnabled(): boolean {
  // Check if explicitly disabled via environment variable
  const enableMapbox = process.env.EXPO_PUBLIC_ENABLE_MAPBOX;
  if (enableMapbox === 'false') {
    return false;
  }

  // Check if running in Expo Go
  // ExecutionEnvironment.StoreClient means running in Expo Go
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return false;
  }

  // Default to enabled for development builds and production
  return true;
}

