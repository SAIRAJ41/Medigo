export type SeverityColor = 'RED' | 'YELLOW' | 'GREEN';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** The only shape the server ever returns (SPEC section 5). */
export interface TriageResult {
  condition: string;
  severityColor: SeverityColor;
  severityLevel: SeverityLevel;
  steps: string[];
  seekFacility: boolean;
}

const COLORS: SeverityColor[] = ['RED', 'YELLOW', 'GREEN'];
const LEVELS: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
const CALL_112 = 'Call 112 (emergency services in India) now.';
const MAX_STEPS = 8;

/**
 * Finds the first complete {...} object in the text, skipping code fences and any text around it.
 * Braces inside JSON strings are ignored.
 */
function extractFirstJsonObject(raw: string): string | null {
  const text = raw.replace(/```(?:json)?/gi, '');
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Removes a leading "1." / "2)" the model may add; the app numbers steps itself. */
const cleanStep = (s: string) => s.replace(/^\s*\d+\s*[.)-]\s*/, '').trim();

export class ResponseValidator {
  /** Parses and checks the model reply. Anything wrong returns the safe fallback. */
  validate(raw: string): TriageResult {
    const json = extractFirstJsonObject(raw);
    if (!json) return this.fallback();

    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      return this.fallback();
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return this.fallback();
    const r = data as Record<string, unknown>;

    const condition = typeof r.condition === 'string' ? r.condition.trim() : '';
    if (!condition || condition.length >= 120) return this.fallback();

    if (typeof r.severityColor !== 'string' || !COLORS.includes(r.severityColor as SeverityColor)) return this.fallback();
    if (typeof r.severityLevel !== 'string' || !LEVELS.includes(r.severityLevel as SeverityLevel)) return this.fallback();
    const severityColor = r.severityColor as SeverityColor;
    const severityLevel = r.severityLevel as SeverityLevel;

    if (!Array.isArray(r.steps) || r.steps.length < 1 || r.steps.length > MAX_STEPS) return this.fallback();
    if (!r.steps.every((s): s is string => typeof s === 'string' && s.trim().length > 0)) return this.fallback();
    let steps = (r.steps as string[]).map(cleanStep).filter(Boolean);
    if (steps.length === 0) return this.fallback();

    if (typeof r.seekFacility !== 'boolean') return this.fallback();
    let seekFacility = r.seekFacility;

    // RED always means: go to a facility, and call 112 is one of the steps.
    if (severityColor === 'RED') {
      seekFacility = true;
      if (!steps.some((s) => /\b112\b/.test(s))) steps = [CALL_112, ...steps].slice(0, MAX_STEPS);
    }

    return { condition, severityColor, severityLevel, steps, seekFacility };
  }

  /** Safe default (SPEC section 5, point 6). */
  fallback(): TriageResult {
    return {
      condition: 'Unable to assess. Please seek medical help',
      severityColor: 'RED',
      severityLevel: 'HIGH',
      steps: [
        CALL_112,
        'If you can travel safely, go to the nearest hospital.',
        'Stay with the person and keep them calm and still until help arrives.',
      ],
      seekFacility: true,
    };
  }
}
