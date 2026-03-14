# StudyBug

A social study-tracking app that helps you log focus sessions, see where friends are studying on a map, and stay accountable together.

---

## What is StudyBug?

StudyBug is a social study-tracking app that helps you log focus sessions and see where friends are studying on a map so you can stay accountable together. Sessions are tagged with your location (with permission) and stored in the cloud so your data and friend graph sync across devices.

**Core features:**

- Record study sessions with a timer, name, location, focus level, and notes (public or private)
- See friends on a map in real time when they have an active session
- Home feed of recent study sessions from you and your friends
- Friend system: send/accept requests, view friends list, see who’s studying where

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Expo](https://expo.dev) (SDK 54) with [React Native](https://reactnative.dev) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| **Language** | TypeScript |
| **Backend / Auth / DB** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) |
| **Maps** | [Mapbox](https://www.mapbox.com) via [@rnmapbox/maps](https://github.com/rnmapbox/maps) |
| **State / Data** | React hooks, Supabase client; auth context for session |
| **UI** | React Native core + Expo modules (e.g. `expo-image`, `expo-location`, `expo-haptics`), custom components |

### Notable dependencies

- **Auth:** Supabase Auth (email/password, with forgot-password flow).
- **Storage:** Supabase Storage for profile pictures and session images.
- **Maps:** `@rnmapbox/maps` — requires **native builds** (not Expo Go).
- **Navigation:** Expo Router (Stack + Tabs), React Navigation under the hood.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Expo CLI** (optional; `npx expo` is enough)
- **iOS:** macOS with Xcode and CocoaPods (for `expo run:ios`)
- **Android:** Android Studio and SDK (for `expo run:android`)
- **Supabase** project ([supabase.com](https://supabase.com))
- **Mapbox** account and tokens ([mapbox.com](https://www.mapbox.com)) for map features and native builds

---

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd studybug
npm install
```

### 2. Environment variables

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with:

```bash
# Required — Supabase (from project Settings → API)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for maps and native builds — Mapbox
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
MAPBOX_DOWNLOADS_TOKEN=your_mapbox_downloads_token
```

- **Supabase:** Create a project, then get URL and anon key from **Settings → API**.
- **Mapbox:** Create a public token with `maps:read` and `styles:read`. For native builds, create a **secret Downloads token** with `DOWNLOADS:READ` and set `MAPBOX_DOWNLOADS_TOKEN`.

Keep `.env` out of version control (it should be in `.gitignore`).

### 3. Supabase setup

- Enable **Email** auth in Supabase (and optionally confirm email settings).
- Create tables and RLS policies to match what the app expects (e.g. `profiles`, sessions, friends, friend_requests). If the repo includes SQL migrations or schema docs, run or follow those.
- Configure Storage buckets (e.g. `profile_pictures`, any bucket used for session images) and policies so authenticated users can read/write as intended.

### 4. Mapbox (optional but needed for map tab)

- See [MAPBOX_SETUP.md](./MAPBOX_SETUP.md) in this repo for token setup and native build notes.
- For Android/iOS native builds, `MAPBOX_DOWNLOADS_TOKEN` must be set (e.g. in `.env` or in `android/gradle.properties` / iOS config as documented).

---

## Running the app

### Development (Expo dev server)

```bash
npm start
```

Then:

- Press **i** for iOS simulator or **a** for Android emulator (requires native build; see below), or
- Scan the QR code with **Expo Go** — note: **Mapbox and some native modules do not work in Expo Go**; use a dev build for full functionality.

### Native builds (required for maps and full features)

**iOS (macOS only):**

```bash
npm run ios
```

Uses UTF-8 and runs `expo run:ios`. First build can take several minutes. If you hit CocoaPods encoding issues, ensure `LANG=en_US.UTF-8` and `LC_ALL=en_US.UTF-8` (these are set in the `ios` script). To open in Xcode: `npm run ios:xcode`, then build/run from Xcode (⌘R).

**Android:**

```bash
npm run android
```

Ensure `MAPBOX_DOWNLOADS_TOKEN` is set for Mapbox SDK download.

---

## Project structure (high level)

```
studybug/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Splash, onboarding, login, register, forgot-password
│   ├── (tabs)/             # Main tabs: Home, Map, Record, Friends, Profile
│   ├── session-details.tsx # New session form (name, location, focus, note)
│   ├── session-summary.tsx # Post-session summary
│   ├── add-friends.tsx
│   ├── friend-requests.tsx
│   └── _layout.tsx        # Root layout, auth redirect
├── components/             # Reusable UI (e.g. SessionPost, map, end-session popup)
├── controllers/            # Data/API (feed, study-session, friends, etc.)
├── lib/                    # Supabase client and shared utilities
├── hooks/                  # e.g. useAuthContext
├── assets/                 # Images, icons
├── ios/                    # Native iOS (Expo prebuild)
├── android/                 # Native Android (Expo prebuild)
├── app.json                # Expo config (name, slug, plugins)
└── package.json
```

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run iOS app (native build, UTF-8 env) |
| `npm run ios:simulator` | Run iOS targeting iPhone 16 simulator |
| `npm run ios:xcode` | Open `ios/studybug.xcworkspace` in Xcode |
| `npm run android` | Run Android app (native build) |
| `npm run web` | Start for web (Expo web) |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

---

## Deployment / Release

- **Expo EAS (recommended):** Configure `eas.json` and use `eas build` for iOS/Android and `eas submit` for stores. Set all env vars (Supabase, Mapbox) in EAS secrets or in your CI.
- **Store readiness:** Update `app.json` (or `app.config.js`) with proper `version`, `ios.bundleIdentifier`, `android.package`, and store metadata. Replace `com.anonymous.studybug` with your own bundle ID / package name.
- **Backend:** Ensure Supabase project is production-ready (RLS, backups, auth settings). Do not commit `.env`; use secrets in CI and EAS.

---

## Documentation in repo

- [MAPBOX_SETUP.md](./MAPBOX_SETUP.md) — Mapbox tokens and native build setup  
- [MAPBOX_FEATURE_FLAG.md](./MAPBOX_FEATURE_FLAG.md) — Optional map feature flag  
- [ANDROID_TESTING.md](./ANDROID_TESTING.md) — Android dev build notes  

---

## License

See [LICENSE](./LICENSE) in the repository, if present.
