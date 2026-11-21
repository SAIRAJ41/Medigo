# MediGo (web UI, demo data)

AI first-aid triage assistant. This is the full web UI: Dashboard, Chat and Map, built to `SPEC.md`.
All data is **demo data** for now (a "Demo data" badge shows in the top bar).

## Run

Needs Node.js 18 or newer.

```
npm install
npm run dev        # opens at http://localhost:5173
npm run build      # type-check + production build into dist/
```

Test the empty state by opening `http://localhost:5173/?empty=1`.

## Run the triage proxy (real AI)

The proxy in `server/` is the only place that holds the API key.

```
cd server
npm install
cp .env.example .env     # then fill in GEMINI_API_KEY and GEMINI_MODEL
npm run dev              # http://localhost:8787 (GET /health returns {"ok":true})
```

Optional settings in `server/.env`: `PORT` (default 8787), `ALLOWED_ORIGIN` (default `http://localhost:5173`), `ENABLE_IMAGES` (default `false`; set `true` only if your model accepts images).

## Run the app against the proxy

In the project root:

```
cp .env.example .env.local   # VITE_API_URL=http://localhost:8787, VITE_USE_REAL_TRIAGE=true
npm run dev
```

Chat replies now come from the model. History, accounts and hospitals are still sample data, so the "Demo data" badge stays. Without `.env.local` the app uses the built-in mock replies.

## Smoke test

With the proxy running:

```
cd server
npm run smoke                # same as: node scripts/smoke-test.mjs
```

It sends six sample reports and prints the condition, severity and first step for each.

## What works now (with demo data)

- **Dashboard**: stats row, severity donut chart, 5 recent checks, click a check to open it, delete with confirmation, empty state.
- **Chat**: type, attach a photo, or use the mic (browser speech recognition, falls back to a "please type" message). Sends through the full flow: knowledge base search, reply, result card, Red-High escalation card, offline guidance, safe fallback, Save to History.
- **Map**: Leaflet map with facility pins, facility list sorted by distance, nearest highlighted, Directions link. Uses your location, or lists all facilities without distances if denied.
- **Drawer menu** (top left), back arrow, 112 chip on every screen, no bottom navigation.

## Not real yet

- Without `VITE_USE_REAL_TRIAGE=true` the "AI" is a stand-in (`src/mock/MockApiClient.ts`) that picks the best knowledge base match.
- History lives in memory and resets on reload (`src/mock/MockCaseRepository.ts`).
- The 15 first-aid entries and the 6 Goa hospitals are sample data. Have the first-aid wording reviewed by a medical professional before real use.
- Map tiles need internet. Offline tile caching, PWA install and the Android (Capacitor) wrapper come later.

## Switching to real data later

`src/config/env.ts` has two flags: `IS_DEMO_MODE` (mock storage) and `USE_REAL_TRIAGE` (real AI replies through the proxy, set by `VITE_USE_REAL_TRIAGE`). Screens only use the interfaces in `src/data/` and `src/services/`, so the real versions (Dexie storage, the Express proxy through `ApiClient`) slot in at `src/context/ServicesContext.tsx` without touching any screen.

## Structure

```
src/
  screens/      AppShell, DashboardScreen, ChatScreen, MapScreen, LoginScreen, SignUpScreen, ProfileScreen
  components/   common, dashboard, chat, map
  services/     TriageService, RagService, VoiceService, ApiClient, OfflineMapService, LocationService
  data/         repository interfaces, LocalDatabase (stub)
  mock/         ALL demo data and mock implementations
  types/        TriageQuery, TriageResult, Case, Hospital, EmergencyCard, DashboardStats, enums
  styles/       variables.css (the only place colors are defined)
```

## Colors

All colors are CSS variables in `src/styles/variables.css`, mapped into Tailwind in `tailwind.config.js`. No hex values anywhere else.
Severity colors are used only for severity badges, the donut chart and the emergency card. Exception: severity red is also used for form error text and the red border of an invalid input (never for buttons).
