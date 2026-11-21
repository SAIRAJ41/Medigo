import type { TriageQuery } from '../types/TriageQuery';
import type { TriageResult } from '../types/TriageResult';

/** The only class that talks to the server (SPEC section 8). */
export interface IApiClient {
  isOnline(): boolean;
  postTriage(query: TriageQuery): Promise<unknown>;
}

const MAX_SIDE = 1024; // px, longest side after downscaling
const JPEG_QUALITY = 0.85;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // about 3 MB; larger photos are sent without the image

/**
 * Turns a blob: (or data:) image URL into a downscaled JPEG data URL.
 * Returns null if the image cannot be read or is still too large.
 */
async function toUploadDataUrl(src: string): Promise<string | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return null;
    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const bytes = Math.floor((base64.length * 3) / 4);
    return bytes <= MAX_IMAGE_BYTES ? dataUrl : null;
  } catch {
    return null;
  }
}

/** Real client for the Express proxy. Used when USE_REAL_TRIAGE is true. */
export class ApiClient implements IApiClient {
  constructor(
    private readonly baseUrl: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '',
    private readonly timeoutMs = 70000, // always longer than the server's 60 s model timeout
  ) {}

  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Network errors, timeouts and non-2xx statuses throw, so TriageService shows its safe fallback.
   * Only the knowledge base fields the proxy needs are sent as context.
   */
  async postTriage(query: TriageQuery): Promise<TriageResult> {
    const image = query.image ? await toUploadDataUrl(query.image) : null;
    const context = query.context.slice(0, 3).map((c) => ({ conditionName: c.conditionName, severityGuidance: c.severityGuidance }));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/+$/, '')}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query.text, image, context }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return (await res.json()) as TriageResult;
    } finally {
      clearTimeout(timer);
    }
  }
}
