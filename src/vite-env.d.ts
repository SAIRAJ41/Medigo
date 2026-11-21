/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the triage proxy, for example http://localhost:8787 */
  readonly VITE_API_URL?: string;
  /** "true" to use the real proxy for triage replies */
  readonly VITE_USE_REAL_TRIAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
