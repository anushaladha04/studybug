# Mapbox Setup Guide

## 1. Get a Mapbox Access Token

1. Go to [mapbox.com](https://www.mapbox.com)
2. Sign up or log in
3. Navigate to Account → Tokens
4. Create a new token with access to:
   - `maps:read`
   - `styles:read`
5. Copy your token

## 2. Add Environment Variable

Create or update your `.env` file in the project root:

```
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

**⚠️ Important:** Never commit `.env` to git. Add it to `.gitignore` (already done).

## 3. Configure Mapbox for iOS (Native Build)

If you're planning to build for iOS, you may need additional setup:

```bash
npx expo prebuild
```

## 4. Integrating the Map into Your App

### Basic Usage

```tsx
import { StudyMap, LocationUser } from '@/components/map/study-map';

const users: LocationUser[] = [
  {
    id: '1',
    name: 'Alice',
    studying: 'React Native',
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://...',
  },
  // ... more users
];

export function MyMapScreen() {
  return (
    <StudyMap
      users={users}
      onUserPress={(user) => console.log('Pressed:', user)}
      showUserLocation={true}
    />
  );
}
```

### Fetching Real User Data from Supabase

In `app/(tabs)/map.tsx`, replace the mock data with real queries:

```tsx
useEffect(() => {
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, studying, latitude, longitude, image_url')
      .neq('id', currentUserId); // Don't show yourself
    
    if (data) setUsers(data);
  };

  const interval = setInterval(fetchUsers, 5000); // Refresh every 5s
  return () => clearInterval(interval);
}, []);
```

### Updating User Location

Periodically update your location in Supabase:

```tsx
import * as Location from 'expo-location';

useEffect(() => {
  const updateLocation = async () => {
    const location = await Location.getCurrentPositionAsync();
    
    await supabase
      .from('users')
      .update({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        updated_at: new Date(),
      })
      .eq('id', currentUserId);
  };

  const interval = setInterval(updateLocation, 10000); // Every 10s
  return () => clearInterval(interval);
}, []);
```

## 5. Database Schema

Add these fields to your `users` table in Supabase:

```sql
ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN studying TEXT;
ALTER TABLE users ADD COLUMN image_url TEXT;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Create a GeoIndex for faster queries
CREATE INDEX idx_users_location ON users(latitude, longitude);
```

## 6. Permissions

The map component automatically requests location permissions. Users will be prompted when the map opens.

### iOS (Info.plist)

Already handled by Expo. Location permission prompt will appear.

### Android

Already handled by Expo's permissions system.

## 7. Testing

The map screen is available in the tab navigator. Navigate to it to test:
- Your location appears as a blue dot
- Other users appear as pins with their info cards
- Tap a pin to see full details

## Troubleshooting

**"Mapbox token missing"**
- Ensure `.env` file exists with `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Restart the Expo server after adding the token

**"Location permission denied"**
- Grant location permission when prompted
- Check device settings for app permissions

**Map not showing**
- Ensure you're on a physical device or iOS simulator (Android emulator may have issues)
- Check Mapbox token validity
- Verify internet connection
