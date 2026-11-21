import type { Request, Response } from 'express';
import { config } from '../config';
import type { InlineImage, ModelClient } from '../services/ModelClient';
import type { ContextEntry, PromptBuilder } from '../services/PromptBuilder';
import type { ResponseValidator } from '../services/ResponseValidator';

const MAX_TEXT = 1000;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // about 4 MB of image data
const MAX_CONTEXT = 3;
const MAX_CONTEXT_NAME = 100;
const MAX_CONTEXT_GUIDANCE = 1500;
const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

type Parsed = { ok: true; text: string; image?: InlineImage; context: ContextEntry[] } | { ok: false; error: string };

/** Checks the request body. Never echoes or logs the user's text or image. */
function parseBody(body: unknown): Parsed {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  if (b.text !== undefined && b.text !== null && typeof b.text !== 'string') return { ok: false, error: 'text must be a string' };
  const text = typeof b.text === 'string' ? b.text.trim() : '';
  if (text.length > MAX_TEXT) return { ok: false, error: `text must be at most ${MAX_TEXT} characters` };

  let image: InlineImage | undefined;
  if (b.image !== undefined && b.image !== null && b.image !== '') {
    if (typeof b.image !== 'string') return { ok: false, error: 'image must be a data URL' };
    const m = DATA_URL.exec(b.image);
    if (!m) return { ok: false, error: 'image must be a png, jpeg or webp data URL' };
    const bytes = Math.floor((m[2].length * 3) / 4);
    if (bytes > MAX_IMAGE_BYTES) return { ok: false, error: 'image is too large' };
    image = { mimeType: m[1], base64: m[2] };
  }

  if (!text && !image) return { ok: false, error: 'text or image is required' };

  // At most 3 reference entries, each trimmed to a safe length. Anything malformed is skipped.
  const raw = Array.isArray(b.context) ? b.context : [];
  const context: ContextEntry[] = raw
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .filter((c) => typeof c.conditionName === 'string' && typeof c.severityGuidance === 'string')
    .slice(0, MAX_CONTEXT)
    .map((c) => ({
      conditionName: (c.conditionName as string).trim().slice(0, MAX_CONTEXT_NAME),
      severityGuidance: (c.severityGuidance as string).trim().slice(0, MAX_CONTEXT_GUIDANCE),
    }));

  return { ok: true, text, image, context };
}

/** POST /triage: validate, build the prompt, call the model, validate the reply. */
export class TriageController {
  constructor(
    private readonly prompts: PromptBuilder,
    private readonly model: ModelClient,
    private readonly validator: ResponseValidator,
  ) {}

  handleTriage = async (req: Request, res: Response): Promise<void> => {
    const parsed = parseBody(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    try {
      const imageSentToModel = !!parsed.image && config.enableImages;
      const prompt = this.prompts.build({
        text: parsed.text,
        context: parsed.context,
        hasImage: !!parsed.image,
        imageSentToModel,
      });
      const raw = await this.model.generate(prompt, imageSentToModel ? parsed.image : undefined);
      res.json(this.validator.validate(raw)); // the raw model text is never returned
    } catch (err) {
      // Log only the kind of failure, never the user's input or the model output.
      const reason = err instanceof Error && err.message === 'MODEL_TIMEOUT' ? 'timeout' : 'model error';
      console.warn(`[triage] ${reason}; returning fallback`);
      res.status(200).json(this.validator.fallback());
    }
  };
}
