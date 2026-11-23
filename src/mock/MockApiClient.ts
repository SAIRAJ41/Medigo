import type { IApiClient } from '../services/ApiClient';
import type { TriageQuery } from '../types/TriageQuery';
import type { TriageResult } from '../types/TriageResult';

/**
 * DEMO stand-in for the server, used only when VITE_USE_REAL_TRIAGE is off. No AI is called.
 * It builds a reply from the best knowledge base match (its steps and default rating) so the screens can be tested.
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
    return {
      condition: best.conditionName,
      severityColor: best.severityColor,
      severityLevel: best.severityLevel,
      steps: best.severityGuidance.split('\n'),
      seekFacility: best.seekFacility,
    };
  }
}
