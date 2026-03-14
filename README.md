# studybug 🐛

## What is studybug?

studybug is a social productivity app that helps students stay accountable while studying by logging study sessions and sharing progress with friends. The platform combines progress tracking with social motivation, allowing users to view activity feeds, track study hours, and stay consistent through peer accountability. It’s essentially a “Strava for studying,” designed to make studying more engaging and less isolating. [Check out our demo here!](https://docs.google.com/presentation/d/1RR56Ov8RHOEbu8Rjf5Rr4QNz9OQCsQ_BI0xt8XKxV90/edit?usp=sharing)

**Features:**

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


## Contributors

Project Leads: Anusha Ladha & Melissa Shi  
Developers: June Qi, Léo Lhert, Shane Kuk, Brandon Yang, and Dustin Tran
