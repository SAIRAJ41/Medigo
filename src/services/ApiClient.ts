import type { TriageQuery } from '../types/TriageQuery';
import type { TriageResult } from '../types/TriageResult';

/** The only class that talks to the server (SPEC section 8). */
export interface IApiClient {
  isOnline(): boolean;
  postTriage(query: TriageQuery): Promise<unknown>;
}

/** Real client for the Express proxy. Used when IS_DEMO_MODE is false. */
export class ApiClient implements IApiClient {
  constructor(
    private readonly baseUrl: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '',
    private readonly timeoutMs = 20000,
  ) {}

  isOnline(): boolean {
    return navigator.onLine;
  }

  async postTriage(query: TriageQuery): Promise<TriageResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query.text, image: query.image, context: query.context }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return (await res.json()) as TriageResult;
    } finally {
      clearTimeout(timer);
    }
  }
}
