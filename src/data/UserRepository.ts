import type { User } from '../types/User';
import { db, type LocalDatabase } from './LocalDatabase';

/** A user plus the password material. Only AuthService ever sees these extra fields. */
export interface StoredUser extends User {
  passwordSalt: string; // base64, random per user
  passwordHash: string; // base64 PBKDF2 output, never the password itself
  passwordIterations: number;
  /** True for the presentation accounts from src/data/seed/demoAccounts.ts. */
  seeded?: boolean;
}

export type NewStoredUser = Omit<StoredUser, 'userId'>;
export type StoredUserChanges = Partial<Omit<StoredUser, 'userId' | 'createdAt'>>;

/** Services depend on this interface only, so a server-backed version can replace it. */
export interface IUserRepository {
  create(user: NewStoredUser): Promise<StoredUser>;
  findByEmail(email: string): Promise<StoredUser | undefined>;
  getById(id: number): Promise<StoredUser | undefined>;
  update(id: number, changes: StoredUserChanges): Promise<StoredUser>;
  delete(id: number): Promise<void>;
}

/** Accounts in the Dexie `users` table. Email is unique and always lowercase. */
export class DexieUserRepository implements IUserRepository {
  constructor(private readonly database: LocalDatabase = db) {}

  async create(user: NewStoredUser): Promise<StoredUser> {
    await this.database.ready();
    const email = user.email.trim().toLowerCase();
    if (await this.database.users.where('email').equals(email).first()) throw new Error('EMAIL_TAKEN');
    const userId = await this.database.users.add({ ...user, email } as StoredUser);
    return { ...user, email, userId };
  }

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    await this.database.ready();
    return this.database.users.where('email').equals(email.trim().toLowerCase()).first();
  }

  async getById(id: number): Promise<StoredUser | undefined> {
    await this.database.ready();
    return this.database.users.get(id);
  }

  async update(id: number, changes: StoredUserChanges): Promise<StoredUser> {
    await this.database.ready();
    const current = await this.database.users.get(id);
    if (!current) throw new Error('NOT_FOUND');
    const updated: StoredUser = { ...current, ...changes, userId: id };
    // put (not update) so optional fields cleared to undefined are really removed
    await this.database.users.put(updated);
    return updated;
  }

  /** Removes the account and everything it owns: conversations, messages and saved checks. */
  async delete(id: number): Promise<void> {
    await this.database.ready();
    const d = this.database;
    await d.transaction('rw', [d.users, d.conversations, d.messages, d.cases], async () => {
      const convIds = (await d.conversations.where('userId').equals(id).primaryKeys()) as number[];
      await d.messages.where('conversationId').anyOf(convIds).delete();
      await d.conversations.where('userId').equals(id).delete();
      await d.cases.where('userId').equals(id).delete();
      await d.users.delete(id);
    });
  }
}
