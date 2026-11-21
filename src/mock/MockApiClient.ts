import type { IApiClient } from '../services/ApiClient';
import type { TriageQuery } from '../types/TriageQuery';
import type { TriageResult } from '../types/TriageResult';
import { mockSeverityByCondition } from './mockCases';

/**
 * DEMO stand-in for the server. No AI is called.
 * It builds a reply from the best knowledge base match so the screens can be tested.
 * With no match (for example a photo only) it throws, which the app treats as a failed reply
 * and shows the safe fallback. Conversation history (query.history) is ignored here.
 */
export class MockApiClient implements IApiClient {
  isOnline(): boolean {
    return navigator.onLine;
  }

  async postTriage(query: TriageQuery): Promise<TriageResult> {
    await new Promise((r) => setTimeout(r, 900)); // simulated network delay
    const best = query.context[0];
    if (!best) throw new Error('No knowledge base match for this input');
    const sev = mockSeverityByCondition[best.conditionName] ?? { color: 'YELLOW', level: 'MEDIUM', seekFacility: true };
    return {
      condition: best.conditionName,
      severityColor: sev.color,
      severityLevel: sev.level,
      steps: best.severityGuidance.split('\n'),
      seekFacility: sev.seekFacility,
    };
  }
}
