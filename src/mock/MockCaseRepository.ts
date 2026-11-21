import type { ICaseRepository } from '../data/CaseRepository';
import type { Case } from '../types/Case';
import type { DashboardStats } from '../types/DashboardStats';
import { buildMockCases } from './mockCases';

/**
 * In-memory demo repository.
 * Open the app with ?empty=1 in the address bar to start with no cases (tests the empty state).
 */
export class MockCaseRepository implements ICaseRepository {
  private cases: Case[];
  private nextId: number;

  constructor() {
    const empty = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('empty');
    this.cases = empty ? [] : buildMockCases();
    this.nextId = this.cases.length + 1;
  }

  private sorted(): Case[] {
    return [...this.cases].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async save(newCase: Omit<Case, 'caseId'>): Promise<Case> {
    const saved: Case = { ...newCase, caseId: this.nextId++ };
    this.cases.push(saved);
    return saved;
  }

  async getAll(): Promise<Case[]> {
    return this.sorted();
  }

  async getRecent(n: number): Promise<Case[]> {
    return this.sorted().slice(0, n);
  }

  async getById(id: number): Promise<Case | undefined> {
    return this.cases.find((c) => c.caseId === id);
  }

  async delete(id: number): Promise<void> {
    this.cases = this.cases.filter((c) => c.caseId !== id);
  }

  async getStats(): Promise<DashboardStats> {
    const list = this.sorted();
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
