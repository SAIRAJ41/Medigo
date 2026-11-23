# MediGo - Progress

## Done
- Web UI with demo data: Dashboard, Chat, Map, menu, 112 chip, Demo data badge (see README.md).
- UI polish pass: one spacing and radius scale, contrast fixes, focus rings, skeleton loaders, toasts, focus trap in the drawer and dialogs, reduced-motion support.
- **Local accounts (on this device only)**: Login, Sign Up and Profile screens.
  - `src/types/User.ts`, `src/data/UserRepository.ts` (IUserRepository, LocalUserRepository on localStorage), `src/data/SessionStore.ts` (userId only).
  - `src/services/AuthService.ts` (IAuthService): PBKDF2-SHA-512 password hashing with Web Crypto, random salt per user, constant-time compare, lowercase emails, duplicate check, 5 wrong sign-ins lock for 30 s.
  - `src/context/AuthContext.tsx` with `useAuth()`, wired in `App.tsx`. The session survives reload.
  - Signed out: only Login and Sign Up. Signed in: initials button in the top bar opens Profile; the drawer has Profile and Sign out. The Dashboard greets the user by first name.
- **Triage backend**: `server/` Express proxy to the Gemini API (model from `GEMINI_MODEL`), with PromptBuilder, ModelClient (60 s timeout via `MODEL_TIMEOUT_MS`, app waits 70 s; the only place with the key), ResponseValidator (safe RED / HIGH fallback, 112 step forced for RED), TriageController (input limits), CORS to one origin, 20 requests/min per IP, `/health`, and a smoke-test script.
- Chat uses the real proxy when `VITE_USE_REAL_TRIAGE=true` (`USE_REAL_TRIAGE` in `src/config/env.ts`). Photos are downscaled to 1024 px JPEG before upload. Storage, accounts and history are still mock / localStorage, so the Demo data badge stays (tooltip: "Sample history. AI replies are real.").
- **UI redesign (blue-led, flatter)**: new soft-fill tokens (`--color-soft-blue`, `--color-sage`, `--color-warm-cream`, Tailwind `soft-*`), tinted page background, white 12 px cards, 44 px controls, calmer flat 112 chip.
  - Navigation: left sidebar (`src/components/common/Sidebar.tsx`, replaces DrawerMenu) with Menu / Tools groups, collapse to icons (saved in localStorage), signed-in user + Sign out; overlay drawer below md. Slim top bar with page title, back arrow, Demo badge, 112 chip, avatar.
  - Dashboard: hero Total Checks card + Last Check, Nearest Facility (two lines), Red Cases; inline-SVG "Checks over time" (14 days, `ChecksChart.tsx`), restacked Severity Overview bars, Recent Checks card.
  - Chat (blue user bubbles, clear disabled Send), Map, Login / Sign-up (solid blue card band) and Profile (blue summary band, no empty space, emphasized Save) restyled.
  - New Settings, Security and Get Help screens. `ICaseRepository.clearAll()` added (only the mock implements it today). Change password moved from Profile to Security (shared `ChangePasswordCard`, inline success message).

## Later
- **Server auth** replaces local accounts: a server-backed IAuthService and IUserRepository, real sessions and server-side lockouts. The local version is convenience only, not real security.
- Move users from localStorage to Dexie (IndexedDB) with the other stores.
- Saved checks are not yet linked to a user account.
- Real data layer (Dexie), PWA offline support, map tile caching, Capacitor Android wrapper.
- Photo analysis is off by default (`ENABLE_IMAGES=false`); turn it on once the chosen model is confirmed to accept images.
