# Mapbox Feature Flag

This project includes a feature flag system that automatically disables Mapbox when running in Expo Go, allowing your team to test other features without dealing with Android/iOS native builds.

## How It Works

The feature flag automatically detects:
1. **Expo Go environment** - Mapbox is automatically disabled when running in Expo Go (since it requires native modules)
2. **Manual override** - You can explicitly disable Mapbox via environment variable

## Automatic Detection

The system automatically detects if you're running in Expo Go and disables Mapbox accordingly. No configuration needed!

- ✅ **Development Build** - Mapbox enabled
- ✅ **Production Build** - Mapbox enabled  
- ❌ **Expo Go** - Mapbox automatically disabled

## Manual Override

If you want to disable Mapbox even in development builds (for testing purposes), add this to your `.env` file:

```bash
EXPO_PUBLIC_ENABLE_MAPBOX=false
```

To re-enable it, either:
- Remove the variable from `.env`
- Set it to any value other than `"false"` (e.g., `EXPO_PUBLIC_ENABLE_MAPBOX=true`)

## Fallback UI

When Mapbox is disabled, the map screen shows:
- A friendly message explaining Mapbox is disabled
- A list view of nearby users (if any)
- All user interaction still works (tapping users, etc.)

## For Your Team

Your team can now:
1. Use Expo Go to test all features except the map
2. The map screen will show a fallback UI instead of crashing
3. No need to set up Android/iOS builds just to test other features

When they need to test the map functionality, they can use a development build as documented in `ANDROID_TESTING.md`.

