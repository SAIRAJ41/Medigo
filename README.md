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

## What works now (with demo data)

- **Dashboard**: stats row, severity donut chart, 5 recent checks, click a check to open it, delete with confirmation, empty state.
- **Chat**: type, attach a photo, or use the mic (browser speech recognition, falls back to a "please type" message). Sends through the full flow: knowledge base search, reply, result card, Red-High escalation card, offline guidance, safe fallback, Save to History.
- **Map**: Leaflet map with facility pins, facility list sorted by distance, nearest highlighted, Directions link. Uses your location, or lists all facilities without distances if denied.
- **Drawer menu** (top left), back arrow, 112 chip on every screen, no bottom navigation.

## Not real yet

- The "AI" is a stand-in (`src/mock/MockApiClient.ts`). It picks the best knowledge base match. No model is called.
- History lives in memory and resets on reload (`src/mock/MockCaseRepository.ts`).
- The 15 first-aid entries and the 6 Goa hospitals are sample data. Have the first-aid wording reviewed by a medical professional before real use.
- Map tiles need internet. Offline tile caching, PWA install and the Android (Capacitor) wrapper come later.

## Switching to real data later

`src/config/env.ts` has one flag, `IS_DEMO_MODE`. Screens only use the interfaces in `src/data/` and `src/services/`, so the real versions (Dexie storage, the Express proxy through `ApiClient`) slot in at `src/context/ServicesContext.tsx` without touching any screen.

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
Severity colors are used only for severity badges, the donut chart and the emergency card.
