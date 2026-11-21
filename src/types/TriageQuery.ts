import type { EmergencyCard } from './EmergencyCard';
import type { InputType } from './InputType';

/** One earlier message of the current check, sent so follow-ups and corrections are understood. */
export interface HistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

/** At most this many earlier messages are sent, most recent last. */
export const MAX_HISTORY = 6;

export interface TriageQuery {
  text: string;
  image: string | null; // object URL or data URL of the attached photo
  inputType: InputType;
  context: EmergencyCard[]; // top matches from the local knowledge base
  history?: HistoryEntry[]; // earlier messages of the current check (max 6, most recent last, text only)
}
