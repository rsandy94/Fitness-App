# Fitness App - Session Handoff Document

## Project Overview
Personal fitness tracking PWA built with Expo, targeting iOS Safari (add to home screen). Single user app with local PIN auth. Tracks workouts, weights, and progress. Content managed via Google Sheet → CSV → Supabase pipeline.

**Repository:** `D:\Personal Projects\Fitness App`

---

## Current Status: Exercise Swap Feature Live, End-to-End Working

All core features + swap feature operational. 44 exercises across 5 templates, weekly schedule populated, video player embedded inline, exercise swap with smart muscle-based recommendations working. Test swaps persisted in DB. Some UX polish still pending.

---

## What's Been Completed

### Phase 1: Project Setup ✅
- Expo SDK 56 + Expo Router
- NativeWind v4 (Tailwind)
- Dark theme (colors: `#0d1117` bg, `#161b22` surface, `#58a6ff` primary)
- Project structure: `app/`, `components/`, `hooks/`, `lib/`, `store/`

### Phase 2: Database & Data Layer ✅
- Supabase client (`lib/supabase.ts`)
- 8 tables: `exercises`, `workout_templates`, `template_exercises`, `template_exercise_overrides` (new), `weekly_schedule`, `workout_sessions`, `set_entries`, `weight_logs`
- RLS: allow all (single user)
- TanStack Query hooks, Zustand store for active workout

### Phase 3: Auth & Navigation ✅
- PIN entry screen (4-digit, AsyncStorage)
- Auth guard, bottom tabs (Dashboard, Schedule, Progress)

### Phase 4-9: All Screens ✅
- **Dashboard:** Greeting, weight check-in modal, today's workout card
- **Schedule:** Weekly view with day cards
- **Workout Detail:** Exercise list with thumbnails + sets/reps + 3-dots menu
- **Exercise Detail:** Embedded YouTube player (inline), muscle groups, instructions
- **Active Session:** Set tracking, timer, notes, add/remove sets, finish
- **Progress:** Custom SVG weight chart

### Phase 10: Content Seeding Pipeline ✅
- `scripts/seed.mjs` — idempotent Node seeder (~280 lines)
- Reads `fitness-app/data/*.csv` from Google Sheet exports
- Auto-fetches YouTube thumbnails (maxresdefault → sddefault → hqdefault)
- Local file override via `thumbnail_file` column
- Example CSVs in `fitness-app/data/example/`

### Phase 11: Weekly Schedule ✅
- 4th CSV tab (`weekly_schedule.csv`)
- PPL + Upper: Sun/Push, Mon/Pull, Tue/Lower 1, Wed/Rest, Thu/Upper, Fri/Lower 2, Sat/Rest

### Phase 12: Video Embed ✅
- `react-native-youtube-iframe` inline playback
- Required `react-native-web-webview` peer dep
- `Dimensions`-based sizing (width - 32 padding, 16:9 aspect ratio)

### Phase 13: Exercise Swap Feature ✅ (NEW this session)
- 3-dots menu per exercise in workout detail
- Swap modal with All/Muscle tabs, search, recommendations
- Smart muscle-based matching (group-level overlap)
- "Workout Modified" banner + Undo button
- SWAPPED badge on overridden exercises
- Per-session override table — doesn't modify the underlying template

---

## Current Database State (live)

- **44 exercises** across 5 workout types (push, pull, lower1, lower2, upper)
- **5 templates:** Push, Pull, Lower 1, Lower 2, Upper
- **28 template_exercise links** with sets/reps/sort_order
- **7 weekly_schedule rows** (PPL + Upper with 2 rest days)
- **2 template_exercise_overrides** (test swaps from user)
- **0 workout_sessions / set_entries / weight_logs** (user-driven)

---

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Expo + Expo Router | SDK 56 |
| Styling | NativeWind (Tailwind) | v4 |
| Backend | Supabase | Postgres + Storage |
| Server State | TanStack Query | v5 |
| Local State | Zustand | v4 |
| Charts | Custom SVG | react-native-svg |
| Video | react-native-youtube-iframe | + react-native-web-webview peer |
| Auth | Local PIN | AsyncStorage |
| Seeding | papaparse + Node | scripts/seed.mjs |

---

## Supabase Configuration

- **URL:** `https://ubgmeqijydyzehxzkibj.supabase.co`
- **Anon Key:** `sb_publishable_GZlgEqbZKKHFOAlFexfHYA_PWHYJH9G`
- **Storage Bucket:** "Thumbnails" (public)
- **Auth:** Single user, local PIN

### Migrations to run
1. `fitness-app/supabase-setup.sql` — base schema
2. `fitness-app/fix-storage-rls.sql` — storage RLS
3. `fitness-app/fix-lower-types.sql` — CHECK constraints allow `lower1`/`lower2`
4. `fitness-app/add-template-overrides.sql` — new override table ← **MUST BE RUN for swap to work**

---

## Project Structure

```
D:\Personal Projects\Fitness App\
├── package.json                       # has `seed` script
├── HANDOFF.md                         # this file
├── app/                               # Expo Router
│   ├── _layout.tsx                    # auth guard + QueryClient
│   ├── (auth)/pin.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                  # Dashboard
│   │   ├── schedule.tsx
│   │   └── progress.tsx
│   ├── workout/
│   │   ├── [templateId].tsx           # exercise list + 3-dots menu + swap
│   │   └── swap/
│   │       └── [templateExerciseId].tsx  # swap selection modal
│   ├── exercise/[exerciseId].tsx      # embedded YouTube player
│   └── session/[sessionId].tsx
├── components/
│   └── LineChart.tsx
├── hooks/
│   ├── useExercises.ts                # override-aware queries + mutations
│   ├── useWorkoutSessions.ts
│   └── useWeightLogs.ts
├── lib/
│   ├── supabase.ts                    # DB types (incl. template_exercise_overrides)
│   ├── storage.ts
│   ├── utils.ts
│   └── muscleMap.ts                   # NEW: muscle normalization
├── store/
│   └── sessionStore.ts
├── fitness-app/
│   ├── supabase-setup.sql
│   ├── fix-storage-rls.sql
│   ├── fix-lower-types.sql
│   ├── add-template-overrides.sql     # NEW
│   ├── Screenshots/
│   ├── Thumbnails-local-backup/       # legacy, can delete
│   ├── scripts/
│   │   ├── seed.mjs                   # main seeder
│   │   └── upload-thumbnails.js       # legacy, can delete
│   └── data/
│       ├── README.md
│       ├── exercises.csv
│       ├── workout_templates.csv
│       ├── template_exercises.csv
│       ├── weekly_schedule.csv
│       └── example/
│           ├── exercises.csv
│           ├── workout_templates.csv
│           ├── template_exercises.csv
│           └── weekly_schedule.csv
```

---

## How to Run

```bash
cd "D:\Personal Projects\Fitness App"
npm run web        # http://localhost:8081
npm run seed       # sync CSVs → Supabase (idempotent)
```

### Reset PIN
Browser DevTools → Console:
```javascript
localStorage.clear(); location.reload();
```

### Clear Metro cache
```bash
npx expo start --clear
```

---

## Exercise Swap Feature (Phase 13)

### Database
`template_exercise_overrides` table:
- `id` uuid PK
- `template_exercise_id` uuid → `template_exercises(id)` (UNIQUE — one override per slot)
- `exercise_id` uuid → `exercises(id)`
- `created_at` timestamptz

### Files
| File | Role |
|---|---|
| `lib/muscleMap.ts` | Sub-muscle → main group normalization + overlap helpers |
| `hooks/useExercises.ts` | Override-aware `useTemplateExercises`, mutations `useSwapExercise` / `useUndoSwap` |
| `app/workout/swap/[templateExerciseId].tsx` | Modal with All/Muscle tabs, search, recommendations |
| `app/workout/[templateId].tsx` | 3-dots menu → inline popup → navigate to swap screen |

### Muscle Mapping
`MAIN_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Forearms']`

Sub-muscle → group lookup in `MUSCLE_GROUP_MAP`. Handles both:
- Well-formed data: `["Upper Chest", "Front Delts", "Triceps"]`
- Comma-joined bad data: `["Upper chest, Front Delts , Triceps"]` (auto-explodes)

### Recommendation Algorithm
Group-level overlap (not exact muscle string match):
- `countMuscleOverlap(a, b)` maps both arrays to groups, counts intersection
- "Upper Chest" and "Middle Chest" both → "Chest" group → overlap = 1+
- 0 overlap → "Other Alternatives"
- >0 overlap → "Recommended Alternatives" (sorted by overlap desc)

### UX Flow
1. Tap 3-dots on exercise → inline menu pops out (anchored to button, z-index 100 to clear siblings)
2. Tap **Swap** → push to `/workout/swap/{templateExerciseId}` (modal)
3. Modal: search bar, All/Muscle tabs
   - **All tab:** Recommended Alternatives (sorted by muscle match count) + Other Alternatives
   - **Muscle tab:** List of main groups → tap → list of exercises for that group
4. Tap exercise → upsert override → `router.back()`
5. Workout page now shows swapped exercise with **SWAPPED** badge, "Workout Modified" banner with **Undo**

---

## CSV Format Reference

### exercises.csv
| Column | Type | Example | Notes |
|---|---|---|---|
| slug | string | `pull-ups` | Storage filename, kebab-case, never change |
| name | string | `Pull Ups` | Display name, UNIQUE in DB, used as upsert key |
| workout_type | enum | `pull` | `push`/`pull`/`lower`/`upper`/`lower1`/`lower2` |
| muscles | string (,-or-;-sep) | `Mid/Upper Back;Biceps` | Comma OR semicolon accepted |
| youtube_link | URL | `https://youtu.be/VIDEO_ID` | Invalid IDs → null thumbnail |
| instructions | text | `Grasp a pull-up bar...` | |
| thumbnail_file | string (optional) | `my-custom.jpg` | Local override; place in `fitness-app/Thumbnails/` |

### workout_templates.csv
| Column | Example |
|---|---|
| name | `Pull` |
| type | `pull` |
| description | `Back, Biceps, Rear Delts` |

### template_exercises.csv
| Column | Example |
|---|---|
| template_name | `Pull` (matches `workout_templates.name`) |
| exercise_name | `Pull Ups` (matches `exercises.name`) |
| sets | `3` |
| reps_range | `6-10` |
| sort_order | `1` (display order within template) |

### weekly_schedule.csv
| Column | Example | Notes |
|---|---|---|
| day_of_week | `0` (Sun) to `6` (Sat) | UNIQUE per day |
| template_name | `Push` or empty | Empty = rest day |
| is_rest_day | `true`/`false` | `true` for empty-template days |

---

## Key Decisions Made

1. **Expo over pure PWA** - Free APK path later
2. **Local PIN auth** - No Supabase auth
3. **Dark theme only** - No toggle
4. **Custom SVG chart** - Avoids react-native-chart-kit web issues
5. **Screenshots as source of truth** - UI defers to screenshots
6. **lower1/lower2 as distinct types** - Quad-focused vs hamstring-focused
7. **Slug decoupled from name** - Slug = Storage URL stability; name = upsert key
8. **YouTube auto-fetch thumbnails** - Local file override available
9. **Inline YouTube embed over external link** - Per user feedback
10. **Dimensions-based video sizing** - Fixed initial render size
11. **Per-session override table (NOT direct template edit)** - Per user decision: swap scoped to template_exercises row, doesn't change underlying template
12. **Group-level muscle overlap** - Upper/Middle Chest match (smart recommendations)
13. **Inline popup menu (not Modal)** - Anchored to 3-dots, z-index 100 to clear siblings

---

## Known Issues & Gotchas

### Fixed
1. SSR `window is not defined` - conditional storage
2. Expo Router array style - `StyleSheet.flatten()`
3. react-native-chart-kit web warnings - custom SVG
4. PIN screen not working - removed hidden TextInput
5. Weight entry missing - modal on Dashboard
6. Constraint violation on `lower1`/`lower2` - `fix-lower-types.sql`
7. `react-native-web-webview` missing peer - installed
8. YouTube iframe not filling container - Dimensions sizing
9. **Muscles stored as single comma-joined string** - seeder now splits on `,` or `;`; `getMainMuscleGroup` also splits on commas as fallback
10. **PostgREST returns to-one as object, not array** - `asArray` helper in `useExercises.ts`
11. **3-dots menu covered by sibling cards** - `zIndex: 100` on active row

### Open / Potential
- AsyncStorage on web uses localStorage (works but not ideal for production)
- No offline support yet
- No error boundaries on individual screens
- Video embed not resize-responsive (fixed initial render)
- One bad YouTube link: `kpzUeFLReEA` (Low Incline Dumbbell Press) returns 404
- Typo in CSV: "Front Deltes" (2 exercises: Bench press, Flat Dumbbell Press) — not in muscle map
- Typo slug: `berbell-row` (should be `barbell-row`)
- 2 test swap overrides in DB from user testing — clear via Undo button or Supabase Studio

### Data Quirks
- 44 exercises, but the original 6 push exercises have richer user-written instructions
- "Recommend" tab in swap shows exercises matching the GROUP not the exact muscle (e.g., Upper Chest and Middle Chest recommend each other)
- The `unique` on `template_exercise_id` means one swap per slot; can't have two overrides stacked

---

## Pending Work

### High Priority
- [ ] Fix bad YouTube link `kpzUeFLReEA`
- [ ] Fix `berbell-row` slug typo + "Front Deltes" muscle typo in CSV
- [ ] Test full user flow end-to-end on iOS Safari
- [ ] Clean up 2 test override rows in DB (or leave as-is)

### Medium Priority (Swap feature)
- [ ] Confirm swap persists correctly on iOS Safari
- [ ] Add Undo confirmation if many swaps made
- [ ] Add "See Changes" detail view (currently just banner + Undo)
- [ ] Show count of swaps in banner

### Medium Priority (App)
- [ ] Add rest timer between sets in active session
- [ ] Auto-populate previous session data
- [ ] Goal weight + recent weights on Dashboard
- [ ] Date picker for historical weight entries
- [ ] Set completion checkmarks in active session
- [ ] Effort level per set

### Low Priority
- [ ] Remove / Edit Sets & Reps / Superset menu options (currently Swap only)
- [ ] Health tab in swap modal
- [ ] Progress: date range selector, weight change %, trend line
- [ ] PWA manifest.json for "Add to Home Screen"
- [ ] Service worker for offline support
- [ ] Loading skeletons, pull-to-refresh, haptic feedback, animations
- [ ] Test `eas build` for Android APK
- [ ] Delete legacy `fitness-app/Thumbnails-local-backup/` and `fitness-app/scripts/upload-thumbnails.js`

---

## Testing Checklist

- [x] PIN auth works
- [x] Dashboard shows today's workout
- [x] Schedule shows 7 days
- [x] Workout detail shows exercises with thumbnails
- [x] Exercise detail embeds YouTube player
- [x] Start workout creates session
- [x] **Swap creates override row in DB** (verified)
- [x] **Swapped exercise shows in workout** (after zIndex/PostgREST fixes)
- [x] **Workout Modified banner appears**
- [x] **Undo removes override**
- [x] All tab shows chest exercises as recommendations
- [x] Muscle tab shows muscle groups → exercises
- [ ] Track sets with weight and reps
- [ ] Finish workout updates status
- [ ] Progress shows weight graph
- [ ] iOS Safari test (add to home screen)

---

## Environment

- **OS:** Windows
- **Node.js:** v22.17.1
- **npm:** 10.9.2
- **Expo:** SDK 56
- **Browser:** Chrome/Edge for dev, Safari for testing

---

## Notes for Next Session

1. **Test on iOS Safari** — the swap UI is web-friendly but needs iOS verification
2. **Don't delete swap overrides** — they're per-session and intentional
3. **Two test overrides in DB** from this session — user can hit Undo or clear via Supabase Studio
4. **The seeder does NOT delete** — only inserts/updates. To remove exercises, delete from CSV AND `template_exercise_overrides` AND DB.
5. **To add a new exercise**:
   - Add row to `exercises` Sheet tab (with valid `youtube_link` and muscles as comma-separated)
   - Export CSV to `fitness-app/data/exercises.csv`
   - Add row to `template_exercises` if you want it in a workout
   - `npm run seed`
6. **To swap an exercise** in the running app:
   - Open workout → tap 3-dots → Swap → pick new exercise
   - Override persists; tap Undo to revert
7. **CSV uses `,` between muscles** (not `;`) — both work now, but user data uses commas
8. **PWA manifest** is the next big feature for "Add to Home Screen"

---

## Support Files

- `HANDOFF.md` - this file
- `fitness-app/PLAN.md` - original plan
- `fitness-app/SETUP.md` - setup instructions
- `fitness-app/supabase-setup.sql` - base schema
- `fitness-app/fix-storage-rls.sql` - storage RLS
- `fitness-app/fix-lower-types.sql` - allows lower1/lower2
- `fitness-app/add-template-overrides.sql` - override table
- `fitness-app/data/README.md` - seeding workflow
- `fitness-app/data/example/` - reference CSVs
- `fitness-app/Screenshots/` - UI reference

---

**Last updated:** 2026-07-08
**Status:** Exercise swap feature live and working. 44 exercises, 5 templates, 7 schedule days, 2 test overrides in DB. Ready for iOS testing and feature polish.
