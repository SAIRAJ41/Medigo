import type { SeverityColor } from './SeverityColor';

export interface DashboardStats {
  totalChecks: number;
  lastCheck: string | null; // ISO date string
  lastCheckSeverity: SeverityColor | null;
  nearestFacility: string | null;
  nearestDistanceKm: number | null;
  severityCounts: Record<SeverityColor, number>;
}
