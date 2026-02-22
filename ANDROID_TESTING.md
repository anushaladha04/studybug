# Testing on Android Emulator

## Important: Mapbox Requires Development Build

**⚠️ `@rnmapbox/maps` does NOT work with Expo Go** because it requires native modules. You must use a development build.

## Prerequisites

1. **Android Studio** installed with Android SDK
2. **Android Emulator** created and running
3. **Development build setup** (handled automatically by `expo run:android`)

## Development Build (Required for Mapbox)

### Step 1: Start Android Emulator

1. Open **Android Studio**
2. Go to **Tools → Device Manager**
3. Click **▶ Play** button next to an emulator (or create one if needed)
4. Wait for emulator to fully boot

**Optional: Check if emulator is detected**
```bash
# On Windows, use full path to adb (if not in PATH)
# Typical location:
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices

# Or add to PATH: Add %LOCALAPPDATA%\Android\Sdk\platform-tools to your PATH
# Then you can use: adb devices
```

**Note:** You can skip the `adb devices` check - `npm run android` will work if the emulator is running.

### Step 2: Build and Run on Android
```bash
# This will build and install the app on the emulator
npm run android
# or
npx expo run:android
```

This command will:
- Build the native Android app
- Install it on the emulator
- Launch the app automatically

### Build Time Expectations

**First Build (Cold Build):**
- **5-15 minutes** - Compiles all native code, downloads dependencies, builds APK
- This is normal! The first build is always the slowest
- You'll see Gradle downloading dependencies, compiling Java/Kotlin, and building native modules

**Subsequent Builds:**
- **30 seconds - 3 minutes** - Much faster as Gradle caches are populated
- Only changed code is recompiled
- If you only change JavaScript/TypeScript, it's usually under 1 minute

**What You'll See:**
1. `> Task :app:preBuild` - Setting up build
2. `> Task :app:compileDebugJavaWithJavac` - Compiling Java code
3. `> Task :app:mergeDebugNativeLibs` - Merging native libraries (Mapbox, etc.)
4. `> Task :app:packageDebug` - Creating APK
5. `> Task :app:installDebug` - Installing on emulator
6. App launches automatically

**If it's taking longer than 15 minutes:**
- Check your internet connection (downloading dependencies)
- Ensure Android Studio SDK is fully installed
- Try closing other heavy applications
- Check if antivirus is scanning build files

### Step 3: View Logs (Optional)
```bash
# In a separate terminal, view logs
npx expo start --dev-client
```

## Troubleshooting

### Emulator Not Detected

**Option 1: Use full path to adb (Windows)**
```bash
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
```

**Option 2: Add ADB to PATH (Windows)**
1. Find your Android SDK location (usually `%LOCALAPPDATA%\Android\Sdk\platform-tools`)
2. Add it to your system PATH:
   - Open System Properties → Environment Variables
   - Add `%LOCALAPPDATA%\Android\Sdk\platform-tools` to PATH
   - Restart terminal
3. Then use: `adb devices`

**Option 3: Just run the build**
- If emulator is running, `npm run android` will detect it automatically
- No need to check with `adb devices` first

### Mapbox Not Showing
1. **Check Access Token**: Ensure your Mapbox token is valid
2. **Check Permissions**: Mapbox should work without location permissions (using default location)
3. **Check Logs**: 
   ```bash
   npx expo start --dev-client
   # Look for Mapbox-related errors
   ```

### Build Errors
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Slow Performance
- Use a newer Android emulator (API 30+)
- Allocate more RAM to emulator (4GB+ recommended)
- Enable hardware acceleration in Android Studio

## Quick Test Commands

```bash
# Start emulator and run app
npm run android

# Start dev server separately
npm start

# Check if emulator is connected (Windows - use full path if not in PATH)
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
```

## Mapbox-Specific Notes

- **⚠️ Requires development build** - Cannot use Expo Go
- The map uses a default location (San Francisco) that works without GPS
- No location permissions needed for basic map display
- Map should render immediately on Android emulator
- If map is blank, check console for Mapbox token errors
- **First build: 5-15 minutes** (compiles all native code including Mapbox)
- **Subsequent builds: 30 seconds - 3 minutes** (incremental builds are much faster)

