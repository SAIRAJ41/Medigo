# MediGo - Progress

## Done
- Web UI with demo data: Dashboard, Chat, Map, drawer menu, 112 chip, Demo data badge (see README.md).
- UI polish pass: one spacing and radius scale, contrast fixes, focus rings, skeleton loaders, toasts, focus trap in the drawer and dialogs, reduced-motion support.
- **Local accounts (on this device only)**: Login, Sign Up and Profile screens.
  - `src/types/User.ts`, `src/data/UserRepository.ts` (IUserRepository, LocalUserRepository on localStorage), `src/data/SessionStore.ts` (userId only).
  - `src/services/AuthService.ts` (IAuthService): PBKDF2-SHA-512 password hashing with Web Crypto, random salt per user, constant-time compare, lowercase emails, duplicate check, 5 wrong sign-ins lock for 30 s.
  - `src/context/AuthContext.tsx` with `useAuth()`, wired in `App.tsx`. The session survives reload.
  - Signed out: only Login and Sign Up. Signed in: initials button in the top bar opens Profile; the drawer has Profile and Sign out. The Dashboard greets the user by first name.
- **Triage backend**: `server/` Express proxy to the Gemini API (model from `GEMINI_MODEL`), with PromptBuilder, ModelClient (20 s timeout, the only place with the key), ResponseValidator (safe RED / HIGH fallback, 112 step forced for RED), TriageController (input limits), CORS to one origin, 20 requests/min per IP, `/health`, and a smoke-test script.
- Chat uses the real proxy when `VITE_USE_REAL_TRIAGE=true` (`USE_REAL_TRIAGE` in `src/config/env.ts`). Photos are downscaled to 1024 px JPEG before upload. Storage, accounts and history are still mock / localStorage, so the Demo data badge stays (tooltip: "Sample history. AI replies are real.").

## Later
- **Server auth** replaces local accounts: a server-backed IAuthService and IUserRepository, real sessions and server-side lockouts. The local version is convenience only, not real security.
- Move users from localStorage to Dexie (IndexedDB) with the other stores.
- Saved checks are not yet linked to a user account.
- Real data layer (Dexie), PWA offline support, map tile caching, Capacitor Android wrapper.
- Photo analysis is off by default (`ENABLE_IMAGES=false`); turn it on once the chosen model is confirmed to accept images.
