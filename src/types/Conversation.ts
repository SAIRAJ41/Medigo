import type { InputType } from './InputType';
import type { SeverityColor } from './SeverityColor';
import type { SeverityLevel } from './SeverityLevel';
import type { TriageResult } from './TriageResult';

/** Where the title came from: the first message, the first result's condition, or the user (rename). */
export type TitleSource = 'message' | 'result' | 'user';

/** One chat thread in the history panel. */
export interface Conversation {
  id: number;
  userId: number;
  title: string;
  titleSource: TitleSource;
  createdAt: string; // ISO
  updatedAt: string; // ISO, bumped by every new message
  /** Severity of the latest result, for the badge in the history list. */
  lastSeverityColor?: SeverityColor;
  lastSeverityLevel?: SeverityLevel;
  seeded?: boolean;
}

/** RESULT = valid AI reply, FALLBACK = safe default, OFFLINE = knowledge base only. */
export type MessageOutcome = 'RESULT' | 'FALLBACK' | 'OFFLINE';

/** One stored chat message. Photos are not stored, only the fact that one was attached (inputType PHOTO). */
export interface ChatMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  text: string;
  inputType: InputType;
  result: TriageResult | null;
  outcome: MessageOutcome | null;
  timestamp: string; // ISO
  /** Set when this result was saved to history (links to cases.caseId). */
  caseId?: number;
  seeded?: boolean;
}

export type NewChatMessage = Omit<ChatMessage, 'id' | 'conversationId'>;
