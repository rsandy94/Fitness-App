# Fitness App - Setup & Run Guide

## Prerequisites

- **Node.js** v18 or newer (tested on v22)
- **npm** (comes with Node.js)
- A modern browser (Chrome, Edge, Safari, Firefox)

## First-Time Setup

### 1. Install dependencies

```bash
cd "D:\Personal Projects\Fitness App"
npm install
```

### 2. Supabase backend

The database, storage bucket, seed data, and RLS policies should already be set up. If you need to redo any of it:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Run `supabase-setup.sql` (creates tables, seed data, RLS policies)
3. Run `fix-storage-rls.sql` (fixes storage bucket permissions for thumbnail uploads)
4. Upload thumbnails and link them:
   ```bash
   node scripts/upload-thumbnails.js
   ```
5. Copy the SQL UPDATE statements from the script output and run them in Supabase SQL Editor

## Running the App

### Start the dev server (web)

```bash
cd "D:\Personal Projects\Fitness App"
npm run web
```

This starts Metro Bundler. Wait for:

```
Waiting on http://localhost:8081
```

Then open **http://localhost:8081** in your browser.

### Other platforms

```bash
npm run android    # Android emulator/device
npm run ios        # iOS (requires macOS)
npm run web        # Web browser
```

You can also start Expo without a specific platform and choose interactively:

```bash
npm start
```

## Using the App

1. **First launch:** Create a 4-digit PIN
2. **Subsequent launches:** Enter your PIN to unlock
3. **Dashboard:** Shows greeting, weight check-in, and today's workout
4. **Schedule:** Weekly view of workout days and rest days
5. **Progress:** Weight log graph over time
6. **Workout detail:** Tap a workout to see exercises with thumbnails
7. **Exercise detail:** Tap an exercise to see YouTube link and instructions
8. **Active session:** Tap "Start Workout" to track sets, weights, and reps

## Project Structure

```
Fitness App/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout + auth guard + QueryClient
│   ├── (auth)/pin.tsx          # PIN entry screen
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tab navigator
│   │   ├── index.tsx           # Dashboard
│   │   ├── schedule.tsx        # Weekly schedule
│   │   └── progress.tsx        # Weight progress graph
│   ├── workout/[templateId].tsx # Exercise list for a workout
│   ├── exercise/[exerciseId].tsx # Exercise detail (YouTube + instructions)
│   └── session/[sessionId].tsx # Active workout tracking
├── components/                 # Reusable components
├── hooks/                      # TanStack Query hooks
│   ├── useExercises.ts
│   ├── useWorkoutSessions.ts
│   └── useWeightLogs.ts
├── lib/                        # Core utilities
│   ├── supabase.ts             # Supabase client
│   ├── storage.ts              # AsyncStorage PIN helpers
│   └── utils.ts                # Date/format helpers
├── store/
│   └── sessionStore.ts         # Zustand store for active workout
├── scripts/
│   └── upload-thumbnails.js    # One-time thumbnail upload
├── Screenshots/                # UI reference screenshots
├── Thumbnails/                 # Exercise thumbnail images
├── supabase-setup.sql          # Database setup SQL
├── fix-storage-rls.sql         # Storage RLS fix SQL
├── app.json                    # Expo config
├── tailwind.config.js          # NativeWind/Tailwind config
├── global.css                  # NativeWind CSS entry
├── package.json
└── PLAN.md                     # Full implementation plan
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 56 + Expo Router |
| Styling | NativeWind v4 (Tailwind) |
| Backend | Supabase (Postgres + Storage) |
| Server State | TanStack Query v5 |
| Local State | Zustand v4 |
| Charts | react-native-chart-kit |
| Auth | Local PIN (AsyncStorage) |

## Troubleshooting

### Port 8081 already in use

Kill the process using the port:

```bash
# Find the PID
netstat -ano | findstr :8081
# Kill it (replace PID)
taskkill /PID <PID> /F
```

Or start on a different port:

```bash
npx expo start --web --port 8082
```

### Supabase connection issues

- Verify credentials in `lib/supabase.ts`
- Check that RLS policies are applied (run `supabase-setup.sql` and `fix-storage-rls.sql`)
- Check Supabase dashboard for any service outages

### Thumbnails not showing

1. Verify the "Thumbnails" bucket exists in Supabase Storage and is public
2. Re-run `fix-storage-rls.sql` in Supabase SQL Editor
3. Re-run `node scripts/upload-thumbnails.js`
4. Run the generated SQL UPDATE statements in Supabase SQL Editor

### Metro bundler cache issues

Clear cache and restart:

```bash
npx expo start --clear
```

### App shows blank screen

1. Open browser DevTools (F12) → Console tab
2. Check for JavaScript errors
3. Verify the Expo dev server is running (terminal should show "Waiting on http://localhost:8081")
4. Try hard refresh: Ctrl+Shift+R

## Stopping the Server

In the terminal where Expo is running, press `Ctrl+C`.

## Resetting the PIN

To reset your PIN, clear AsyncStorage in browser DevTools:

```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

This will prompt you to create a new PIN on next launch.
