import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export interface InlineImage {
  mimeType: string; // image/png, image/jpeg or image/webp
  base64: string; // raw base64, no "data:" prefix
}

/** Waits before retry 1 and retry 2 when the model is busy. */
const RETRY_WAITS_MS = [1500, 3000];

const statusOf = (err: unknown): number | undefined => {
  const status = (err as { status?: unknown })?.status;
  return typeof status === 'number' ? status : undefined;
};

/** HTTP 503 / 429 or an UNAVAILABLE error from the API: the model is overloaded, worth a retry. */
const isBusy = (err: unknown): boolean => {
  const status = statusOf(err);
  if (status === 503 || status === 429) return true;
  return err instanceof Error && err.message !== 'MODEL_TIMEOUT' && /\bUNAVAILABLE\b/.test(err.message);
};

/**
 * The ONLY place that uses the API key.
 * No systemInstruction and no JSON mode: Gemma models may not support them, so every
 * instruction lives in the prompt text (see PromptBuilder).
 */
export class ModelClient {
  private readonly ai = new GoogleGenAI({ apiKey: config.apiKey });

  /**
   * Calls the model and returns its raw text. Throws on error or after the timeout.
   * A busy model (HTTP 503 / 429, UNAVAILABLE) is retried up to 2 more times, all inside one MODEL_TIMEOUT_MS budget.
   */
  async generate(prompt: string, image?: InlineImage): Promise<string> {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];
    if (image && config.enableImages) parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });

    const deadline = Date.now() + config.modelTimeoutMs;
    const controller = new AbortController();
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('MODEL_TIMEOUT'));
      }, config.modelTimeoutMs);
    });

    try {
      for (let attempt = 0; ; attempt++) {
        try {
          const call = this.ai.models.generateContent({
            model: config.model,
            contents: [{ role: 'user', parts }],
            config: { temperature: 0.2, abortSignal: controller.signal },
          });
          const response = await Promise.race([call, timeout]);
          const text = response.text;
          if (!text) throw new Error('MODEL_EMPTY_REPLY');
          return text;
        } catch (err) {
          const wait = RETRY_WAITS_MS[attempt];
          // Retry only a busy model, and only if the wait still fits in the time budget. Timeouts are never retried.
          if (wait === undefined || !isBusy(err) || Date.now() + wait >= deadline) throw err;
          console.warn(`[model] busy (${statusOf(err) ?? 'UNAVAILABLE'}), retry ${attempt + 1}/${RETRY_WAITS_MS.length} in ${wait / 1000} s`);
          await Promise.race([new Promise((r) => setTimeout(r, wait)), timeout]);
        }
      }
    } finally {
      clearTimeout(timer);
    }
  }
}
