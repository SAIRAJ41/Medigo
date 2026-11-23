import type { Case } from '../types/Case';
import type { DashboardStats } from '../types/DashboardStats';
import { db, type LocalDatabase } from './LocalDatabase';
import { sessionUserId, type UserIdSource } from './SessionStore';

/** Screens and services depend on this interface only. All methods act on the signed-in user's cases. */
export interface ICaseRepository {
  save(newCase: Omit<Case, 'caseId'>): Promise<Case>;
  getAll(): Promise<Case[]>;
  getRecent(n: number): Promise<Case[]>;
  getById(id: number): Promise<Case | undefined>;
  delete(id: number): Promise<void>;
  /** Removes every saved check of the signed-in user (Settings > Clear saved checks). */
  clearAll(): Promise<void>;
  getStats(): Promise<DashboardStats>;
}

/** Saved checks in the Dexie `cases` table, always filtered by the signed-in user's id. */
export class DexieCaseRepository implements ICaseRepository {
  constructor(
    private readonly database: LocalDatabase = db,
    private readonly userId: UserIdSource = sessionUserId,
  ) {}

  /** Newest first. Empty when nobody is signed in. */
  private async mine(): Promise<Case[]> {
    await this.database.ready();
    const uid = this.userId();
    if (uid === null) return [];
    const list = await this.database.cases.where('userId').equals(uid).toArray();
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /** Clears the "saved" link on chat messages, so their result cards offer "Save" again. */
  private async unlinkMessages(caseIds: number[]) {
    await this.database.messages
      .where('caseId')
      .anyOf(caseIds)
      .modify((m) => {
        delete m.caseId;
      });
  }

  async save(newCase: Omit<Case, 'caseId'>): Promise<Case> {
    await this.database.ready();
    const uid = this.userId();
    if (uid === null) throw new Error('NOT_SIGNED_IN');
    const row = { ...newCase, userId: uid } as Case;
    const caseId = await this.database.cases.add(row);
    return { ...row, caseId };
  }

  getAll(): Promise<Case[]> {
    return this.mine();
  }

  async getRecent(n: number): Promise<Case[]> {
    return (await this.mine()).slice(0, n);
  }

  async getById(id: number): Promise<Case | undefined> {
    await this.database.ready();
    const c = await this.database.cases.get(id);
    return c && c.userId === this.userId() ? c : undefined;
  }

  async delete(id: number): Promise<void> {
    if (!(await this.getById(id))) return; // not this user's case
    const d = this.database;
    await d.transaction('rw', d.cases, d.messages, async () => {
      await d.cases.delete(id);
      await this.unlinkMessages([id]);
    });
  }

  async clearAll(): Promise<void> {
    const ids = (await this.mine()).map((c) => c.caseId);
    const d = this.database;
    await d.transaction('rw', d.cases, d.messages, async () => {
      await d.cases.bulkDelete(ids);
      await this.unlinkMessages(ids);
    });
  }

  async getStats(): Promise<DashboardStats> {
    const list = await this.mine();
    const severityCounts = { RED: 0, YELLOW: 0, GREEN: 0 };
    list.forEach((c) => (severityCounts[c.severityColor] += 1));
    return {
      totalChecks: list.length,
      lastCheck: list[0]?.timestamp ?? null,
      lastCheckSeverity: list[0]?.severityColor ?? null,
      nearestFacility: null, // filled in by the screen from HospitalRepository
      nearestDistanceKm: null,
      severityCounts,
    };
  }
}
