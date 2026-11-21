import type { User } from '../types/User';

/** A user plus the password material. Only AuthService ever sees these extra fields. */
export interface StoredUser extends User {
  passwordSalt: string; // base64, random per user
  passwordHash: string; // base64 PBKDF2 output, never the password itself
  passwordIterations: number;
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

const USERS_KEY = 'medigo.users';

/**
 * Local accounts kept in localStorage for now.
 * TODO: moves to Dexie (IndexedDB, a `users` store) together with the other LocalDatabase stores.
 */
export class LocalUserRepository implements IUserRepository {
  private read(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const list: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? (list as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: StoredUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  async create(user: NewStoredUser): Promise<StoredUser> {
    const list = this.read();
    const email = user.email.trim().toLowerCase();
    if (list.some((u) => u.email === email)) throw new Error('EMAIL_TAKEN');
    const userId = list.reduce((max, u) => Math.max(max, u.userId), 0) + 1;
    const created: StoredUser = { ...user, email, userId };
    this.write([...list, created]);
    return created;
  }

  async findByEmail(email: string): Promise<StoredUser | undefined> {
    const key = email.trim().toLowerCase();
    return this.read().find((u) => u.email === key);
  }

  async getById(id: number): Promise<StoredUser | undefined> {
    return this.read().find((u) => u.userId === id);
  }

  async update(id: number, changes: StoredUserChanges): Promise<StoredUser> {
    const list = this.read();
    const index = list.findIndex((u) => u.userId === id);
    if (index < 0) throw new Error('NOT_FOUND');
    const updated: StoredUser = { ...list[index], ...changes, userId: id };
    list[index] = updated;
    this.write(list);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.write(this.read().filter((u) => u.userId !== id));
  }
}
