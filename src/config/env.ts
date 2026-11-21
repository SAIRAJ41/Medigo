/**
 * One switch for the whole data layer.
 * true  = mock repositories and mock triage service, "Demo data" badge visible.
 * false = real IndexedDB (Dexie) and the proxy ApiClient (to be wired later).
 */
export const IS_DEMO_MODE = true;
