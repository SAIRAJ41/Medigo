import type { SeverityColor } from './SeverityColor';
import type { SeverityLevel } from './SeverityLevel';

/** SPEC section 7: cases. A check the user chose to save to history. */
export interface Case {
  caseId: number;
  /** Owner. Every query is filtered by the signed-in user's id. */
  userId?: number;
  /** The chat conversation this result came from, when there is one. */
  conversationId?: number | null;
  inputText: string;
  inputImagePath: string | null;
  severityColor: SeverityColor;
  severityLevel: SeverityLevel;
  guidance: string; // steps stored as one text value, one step per line
  timestamp: string; // ISO date string
  condition?: string; // short title shown in lists
  /** True for rows created by the presentation seed. */
  seeded?: boolean;
}
