# MediGo - Progress

## Done
- Web UI with demo data: Dashboard, Chat, Map, drawer menu, 112 chip, Demo data badge (see README.md).
- UI polish pass: one spacing and radius scale, contrast fixes, focus rings, skeleton loaders, toasts, focus trap in the drawer and dialogs, reduced-motion support.
- **Local accounts (on this device only)**: Login, Sign Up and Profile screens.
  - `src/types/User.ts`, `src/data/UserRepository.ts` (IUserRepository, LocalUserRepository on localStorage), `src/data/SessionStore.ts` (userId only).
  - `src/services/AuthService.ts` (IAuthService): PBKDF2-SHA-512 password hashing with Web Crypto, random salt per user, constant-time compare, lowercase emails, duplicate check, 5 wrong sign-ins lock for 30 s.
  - `src/context/AuthContext.tsx` with `useAuth()`, wired in `App.tsx`. The session survives reload.
  - Signed out: only Login and Sign Up. Signed in: initials button in the top bar opens Profile; the drawer has Profile and Sign out. The Dashboard greets the user by first name.

## Later
- **Server auth** replaces local accounts: a server-backed IAuthService and IUserRepository, real sessions and server-side lockouts. The local version is convenience only, not real security.
- Move users from localStorage to Dexie (IndexedDB) with the other stores.
- Saved checks are not yet linked to a user account.
- Real data layer (Dexie + Express proxy), PWA offline support, map tile caching, Capacitor Android wrapper.
