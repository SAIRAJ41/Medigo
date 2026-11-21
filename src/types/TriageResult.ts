import type { SeverityColor } from './SeverityColor';
import type { SeverityLevel } from './SeverityLevel';

/** Shape the model must return (SPEC section 5) */
export interface TriageResult {
  condition: string;
  severityColor: SeverityColor;
  severityLevel: SeverityLevel;
  steps: string[];
  seekFacility: boolean;
}

/** e.g. "Red - High" */
export function getSeverityLabel(r: Pick<TriageResult, 'severityColor' | 'severityLevel'>): string {
  const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
  return `${cap(r.severityColor)} - ${cap(r.severityLevel)}`;
}
