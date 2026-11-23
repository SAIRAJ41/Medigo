import type { ChatMessage, Conversation, NewChatMessage } from '../types/Conversation';
import { db, type LocalDatabase } from './LocalDatabase';
import { sessionUserId, type UserIdSource } from './SessionStore';

/** Chat history of the signed-in user. Screens depend on this interface only. */
export interface IConversationRepository {
  /** Starts a conversation titled from the first message (max 40 characters). */
  create(firstMessage: string): Promise<Conversation>;
  /** The signed-in user's conversations, newest activity first. */
  list(): Promise<Conversation[]>;
  /** Conversations whose title contains the text (case-insensitive), newest first. */
  search(text: string): Promise<Conversation[]>;
  getMessages(conversationId: number): Promise<ChatMessage[]>;
  /** Stores a message and bumps the conversation; the first real result also sets the title. */
  addMessage(conversationId: number, message: NewChatMessage): Promise<ChatMessage>;
  /** Links an assistant message to the case created by "Save to History". */
  markSaved(messageId: number, caseId: number): Promise<void>;
  rename(conversationId: number, title: string): Promise<void>;
  /** Deletes the conversation, its messages and the cases saved from it. */
  delete(conversationId: number): Promise<void>;
}

export const TITLE_MAX = 40;

/** First 40 characters of the first message, or a neutral title for a photo-only message. */
export function titleFromMessage(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return 'Photo check';
  return t.length > TITLE_MAX ? `${t.slice(0, TITLE_MAX - 1).trimEnd()}…` : t;
}

/** Conversations and messages in Dexie, always filtered by the signed-in user's id. */
export class DexieConversationRepository implements IConversationRepository {
  constructor(
    private readonly database: LocalDatabase = db,
    private readonly userId: UserIdSource = sessionUserId,
  ) {}

  /** The conversation if it belongs to the signed-in user. */
  private async own(id: number): Promise<Conversation | undefined> {
    await this.database.ready();
    const c = await this.database.conversations.get(id);
    const uid = this.userId();
    return c && uid !== null && c.userId === uid ? c : undefined;
  }

  async create(firstMessage: string): Promise<Conversation> {
    await this.database.ready();
    const uid = this.userId();
    if (uid === null) throw new Error('NOT_SIGNED_IN');
    const now = new Date().toISOString();
    const row = { userId: uid, title: titleFromMessage(firstMessage), titleSource: 'message', createdAt: now, updatedAt: now } as Conversation;
    const id = await this.database.conversations.add(row);
    return { ...row, id };
  }

  async list(): Promise<Conversation[]> {
    await this.database.ready();
    const uid = this.userId();
    if (uid === null) return [];
    const rows = await this.database.conversations.where('userId').equals(uid).toArray();
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async search(text: string): Promise<Conversation[]> {
    const q = text.trim().toLowerCase();
    const all = await this.list();
    return q ? all.filter((c) => c.title.toLowerCase().includes(q)) : all;
  }

  async getMessages(conversationId: number): Promise<ChatMessage[]> {
    if (!(await this.own(conversationId))) return [];
    const rows = await this.database.messages.where('conversationId').equals(conversationId).toArray();
    return rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.id - b.id);
  }

  async addMessage(conversationId: number, message: NewChatMessage): Promise<ChatMessage> {
    const conv = await this.own(conversationId);
    if (!conv) throw new Error('NOT_FOUND');
    const d = this.database;
    return d.transaction('rw', d.conversations, d.messages, async () => {
      const id = await d.messages.add({ ...message, conversationId } as ChatMessage);
      const changes: Partial<Conversation> = { updatedAt: message.timestamp };
      if (message.role === 'assistant' && message.result) {
        changes.lastSeverityColor = message.result.severityColor;
        changes.lastSeverityLevel = message.result.severityLevel;
        // The first real result names the conversation, unless the user renamed it. The safe fallback never does.
        if (conv.titleSource === 'message' && message.outcome !== 'FALLBACK') {
          changes.title = message.result.condition;
          changes.titleSource = 'result';
        }
      }
      await d.conversations.update(conversationId, changes);
      return { ...message, conversationId, id };
    });
  }

  async markSaved(messageId: number, caseId: number): Promise<void> {
    await this.database.ready();
    const m = await this.database.messages.get(messageId);
    if (m && (await this.own(m.conversationId))) await this.database.messages.update(messageId, { caseId });
  }

  async rename(conversationId: number, title: string): Promise<void> {
    const t = title.trim();
    if (!t || !(await this.own(conversationId))) return;
    await this.database.conversations.update(conversationId, { title: t.slice(0, 80), titleSource: 'user' });
  }

  async delete(conversationId: number): Promise<void> {
    if (!(await this.own(conversationId))) return;
    const d = this.database;
    await d.transaction('rw', d.conversations, d.messages, d.cases, async () => {
      await d.messages.where('conversationId').equals(conversationId).delete();
      await d.cases.where('conversationId').equals(conversationId).delete();
      await d.conversations.delete(conversationId);
    });
  }
}
