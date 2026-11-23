import type { SeverityColor } from './SeverityColor';
import type { SeverityLevel } from './SeverityLevel';

/** One knowledge base entry (SPEC section 7: emergency_cards) */
export interface EmergencyCard {
  cardId: number;
  conditionName: string;
  /** First-aid steps, one per line. */
  severityGuidance: string;
  /** Extra words people use for this condition (offline keyword matching). */
  keywords: string[];
  /** Default rating for the condition (offline replies, sample history). */
  severityColor: SeverityColor;
  severityLevel: SeverityLevel;
  seekFacility: boolean;
}
