import Dexie, { type Table } from 'dexie';
import type { Case } from '../types/Case';
import type { ChatMessage, Conversation } from '../types/Conversation';
import type { EmergencyCard } from '../types/EmergencyCard';
import type { Hospital } from '../types/Hospital';
import { runFirstRunJobs } from './seed/firstRun';
import type { StoredUser } from './UserRepository';

/** Small key/value table for one-time jobs (seeding, legacy migration). */
export interface MetaRow {
  key: string;
  value: string;
}

/**
 * Schema history. Each entry is one Dexie version; Dexie runs every missing step in order on open,
 * so existing data is kept. To change the schema later, ADD a new entry (never edit an old one), e.g.
 *   { version: 2, stores: { cases: '++caseId, userId, conversationId, timestamp, newIndex' },
 *     upgrade: (tx) => tx.table('cases').toCollection().modify((c) => { c.newField = 'default'; }) }
 * Only indexed fields are listed in `stores`; all other fields are stored anyway.
 */
const SCHEMA: { version: number; stores: Record<string, string>; upgrade?: (tx: import('dexie').Transaction) => Promise<void> | void }[] = [
  {
    version: 1,
    stores: {
      users: '++userId, &email',
      conversations: '++id, userId, updatedAt',
      messages: '++id, conversationId, caseId',
      cases: '++caseId, userId, conversationId, timestamp',
      hospitals: '++hospitalId',
      emergencyCards: '++cardId, &conditionName',
      meta: '&key',
    },
  },
];

export const DB_VERSION = SCHEMA[SCHEMA.length - 1].version;

/**
 * LocalDatabase: the single door to on-device storage (IndexedDB through Dexie).
 * Only repositories, RagService (through its repository) and the seed module use it.
 */
export class LocalDatabase extends Dexie {
  users!: Table<StoredUser, number>;
  conversations!: Table<Conversation, number>;
  messages!: Table<ChatMessage, number>;
  cases!: Table<Case, number>;
  hospitals!: Table<Hospital, number>;
  emergencyCards!: Table<EmergencyCard, number>;
  meta!: Table<MetaRow, string>;

  private readyPromise: Promise<void> | null = null;

  constructor(name = 'medigo') {
    super(name);
    for (const step of SCHEMA) {
      const v = this.version(step.version).stores(step.stores);
      if (step.upgrade) v.upgrade(step.upgrade);
    }
  }

  /**
   * Opens the database and runs the first-run jobs once: legacy account migration, reference data seed,
   * presentation accounts. Every repository awaits this before its first query.
   */
  ready(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = (async () => {
        await this.open();
        await runFirstRunJobs(this);
      })().catch((err) => {
        this.readyPromise = null; // let the next call try again
        throw err;
      });
    }
    return this.readyPromise;
  }

  async getMeta(key: string): Promise<string | undefined> {
    return (await this.meta.get(key))?.value;
  }

  async setMeta(key: string, value: string): Promise<void> {
    await this.meta.put({ key, value });
  }
}

/** One shared instance for the whole app. */
export const db = new LocalDatabase();
