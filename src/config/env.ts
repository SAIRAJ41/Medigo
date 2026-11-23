/**
 * Storage is real now: accounts, conversations and saved checks live in IndexedDB (Dexie) on this device.
 * true only brings back the "Demo data" badge and the dashboard's demo map position (Panaji); data stays real.
 */
export const IS_DEMO_MODE = false;

/**
 * Shows the "Presentation accounts" card on the Sign in page (seven seeded accounts, one shared password).
 * Set to false for real use.
 */
export const SHOW_DEMO_ACCOUNTS = true;

/**
 * true  = Chat sends triage to the Express proxy (real AI) through ApiClient.
 * false = MockApiClient. Storage, accounts and history stay mock/local either way.
 * Set VITE_USE_REAL_TRIAGE=true in .env.local (see .env.example).
 */
export const USE_REAL_TRIAGE = import.meta.env.VITE_USE_REAL_TRIAGE === 'true';
