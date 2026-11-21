import type { SeverityColor } from './SeverityColor';
import type { SeverityLevel } from './SeverityLevel';

/** SPEC section 7: cases */
export interface Case {
  caseId: number;
  inputText: string;
  inputImagePath: string | null;
  severityColor: SeverityColor;
  severityLevel: SeverityLevel;
  guidance: string; // steps stored as one text value, one step per line
  timestamp: string; // ISO date string
  condition?: string; // short title shown in lists
}
