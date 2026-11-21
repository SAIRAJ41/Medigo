import type { Case } from '../types/Case';
import type { DashboardStats } from '../types/DashboardStats';

/** Screens and services depend on this interface only. */
export interface ICaseRepository {
  save(newCase: Omit<Case, 'caseId'>): Promise<Case>;
  getAll(): Promise<Case[]>;
  getRecent(n: number): Promise<Case[]>;
  getById(id: number): Promise<Case | undefined>;
  delete(id: number): Promise<void>;
  getStats(): Promise<DashboardStats>;
}
