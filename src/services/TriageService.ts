import type { ICaseRepository } from '../data/CaseRepository';
import type { Case } from '../types/Case';
import type { InputType } from '../types/InputType';
import { MAX_HISTORY, type HistoryEntry, type TriageQuery } from '../types/TriageQuery';
import type { TriageResult } from '../types/TriageResult';
import type { IApiClient } from './ApiClient';
import type { RagService } from './RagService';

/** RESULT = valid reply, FALLBACK = bad reply or timeout, OFFLINE = no internet. */
export type OutcomeStatus = 'RESULT' | 'FALLBACK' | 'OFFLINE';

export interface TriageOutcome {
  status: OutcomeStatus;
  result: TriageResult;
  query: TriageQuery;
}

export interface TriageInput {
  text: string;
  image: string | null;
  inputType: InputType;
  /** Earlier messages of the current check (text only, most recent last). */
  history?: HistoryEntry[];
}

/** Safe default: always advise emergency help (SPEC section 5, point 6). */
const fallbackResult = (): TriageResult => ({
  condition: 'Unable to assess. Please seek medical help',
  severityColor: 'RED',
  severityLevel: 'HIGH',
  steps: [
    'Call 112 (emergency services in India) now.',
    'If you can travel safely, go to the nearest hospital.',
    'Stay with the person and keep them calm and still until help arrives.',
  ],
  seekFacility: true,
});

function isValid(r: unknown): r is TriageResult {
  const x = r as TriageResult;
  return (
    !!x &&
    typeof x.condition === 'string' &&
    ['RED', 'YELLOW', 'GREEN'].includes(x.severityColor) &&
    ['LOW', 'MEDIUM', 'HIGH'].includes(x.severityLevel) &&
    Array.isArray(x.steps) &&
    x.steps.length > 0 &&
    x.steps.every((s) => typeof s === 'string') &&
    typeof x.seekFacility === 'boolean'
  );
}

/** Coordinates one triage check from input to saved case. */
export class TriageService {
  constructor(
    private readonly rag: RagService,
    private readonly api: IApiClient,
    private readonly cases: ICaseRepository,
  ) {}

  private async buildQuery(input: TriageInput): Promise<TriageQuery> {
    const history = (input.history ?? []).slice(-MAX_HISTORY);
    // Search with the earlier user messages too, so a short follow-up ("it is bleeding now") still matches.
    const searchText = [...history.filter((h) => h.role === 'user').map((h) => h.text), input.text].join(' ');
    const context = await this.rag.search(searchText); // top 3 matches, works offline
    return { text: input.text, image: input.image, inputType: input.inputType, context, history };
  }

  async submitQuery(input: TriageInput): Promise<TriageOutcome> {
    const query = await this.buildQuery(input);

    // Offline: no AI. Show the closest knowledge base steps instead.
    if (!this.api.isOnline()) {
      const best = query.context[0];
      if (!best) return { status: 'OFFLINE', query, result: { ...fallbackResult(), condition: 'No saved guidance matched' } };
      return {
        status: 'OFFLINE',
        query,
        result: {
          condition: best.conditionName,
          severityColor: 'YELLOW',
          severityLevel: 'MEDIUM',
          steps: best.severityGuidance.split('\n'),
          seekFacility: true,
        },
      };
    }

    // Online: a failed, invalid or late reply always ends in the safe fallback.
    try {
      const reply = await this.api.postTriage(query);
      if (isValid(reply)) return { status: 'RESULT', query, result: reply };
    } catch {
      /* fall through to fallback */
    }
    return { status: 'FALLBACK', query, result: fallbackResult() };
  }

  /** Saves a finished check to history. */
  async saveCase(outcome: TriageOutcome): Promise<Case> {
    const { query, result } = outcome;
    return this.cases.save({
      condition: result.condition,
      inputText: query.text,
      inputImagePath: query.image,
      severityColor: result.severityColor,
      severityLevel: result.severityLevel,
      guidance: result.steps.join('\n'),
      timestamp: new Date().toISOString(),
    });
  }
}
