import { GoogleGenAI } from '@google/genai';
import { config } from '../config';

export interface InlineImage {
  mimeType: string; // image/png, image/jpeg or image/webp
  base64: string; // raw base64, no "data:" prefix
}

/**
 * The ONLY place that uses the API key.
 * No systemInstruction and no JSON mode: Gemma models may not support them, so every
 * instruction lives in the prompt text (see PromptBuilder).
 */
export class ModelClient {
  private readonly ai = new GoogleGenAI({ apiKey: config.apiKey });

  /** Calls the model and returns its raw text. Throws on error or after the timeout. */
  async generate(prompt: string, image?: InlineImage): Promise<string> {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: prompt }];
    if (image && config.enableImages) parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });

    const controller = new AbortController();
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('MODEL_TIMEOUT'));
      }, config.modelTimeoutMs);
    });

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
    } finally {
      clearTimeout(timer);
    }
  }
}
