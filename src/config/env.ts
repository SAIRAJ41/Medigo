/**
 * One switch for the whole data layer.
 * true  = mock repositories and mock triage service, "Demo data" badge visible.
 * false = real IndexedDB (Dexie) and the proxy ApiClient (to be wired later).
 */
export const IS_DEMO_MODE = true;

/**
 * true  = Chat sends triage to the Express proxy (real AI) through ApiClient.
 * false = MockApiClient. Storage, accounts and history stay mock/local either way.
 * Set VITE_USE_REAL_TRIAGE=true in .env.local (see .env.example).
 */
export const USE_REAL_TRIAGE = import.meta.env.VITE_USE_REAL_TRIAGE === 'true';
