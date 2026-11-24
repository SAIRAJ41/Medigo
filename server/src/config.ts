import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Always read server/.env, whatever the working directory is.
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../.env') });

const read = (name: string) => (process.env[name] ?? '').trim();

const apiKey = read('GEMINI_API_KEY');
const model = read('GEMINI_MODEL');

if (!apiKey || !model) {
  const missing = [!apiKey && 'GEMINI_API_KEY', !model && 'GEMINI_MODEL'].filter(Boolean).join(' and ');
  console.error(`[config] Missing ${missing}. Copy server/.env.example to server/.env and fill it in.`);
  process.exit(1);
}

const port = Number(read('PORT') || 8787);
const timeoutMs = Number(read('MODEL_TIMEOUT_MS') || 90_000);

/** Server settings. The API key is read by ModelClient only and is never logged. */
export const config = {
  apiKey,
  model, // never hardcoded: always from GEMINI_MODEL
  port: Number.isFinite(port) && port > 0 ? port : 8787,
  allowedOrigin: read('ALLOWED_ORIGIN') || 'http://localhost:5173',
  enableImages: read('ENABLE_IMAGES').toLowerCase() === 'true',
  // Real replies take 35 to 60 s, plus busy-model retries. The client (ApiClient) waits 100 s, so keep this below that.
  modelTimeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 90_000,
} as const;