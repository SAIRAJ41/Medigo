import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { CaseDialog } from '../components/dashboard/CaseDialog';
import { EmptyProfileState } from '../components/dashboard/EmptyProfileState';
import { RecentChecksList } from '../components/dashboard/RecentChecksList';
import { SeverityPieChart } from '../components/dashboard/SeverityPieChart';
import { StatCard } from '../components/dashboard/StatCard';
import { IS_DEMO_MODE } from '../config/env';
import { useServices } from '../context/ServicesContext';
import type { Case } from '../types/Case';
import type { DashboardStats } from '../types/DashboardStats';
import { formatDistance, formatWhen } from '../utils/format';

// Demo only: a reference point in Panaji used until the user's real location is known.
const DEMO_POSITION = { lat: 15.4909, lon: 73.8278 };

export function DashboardScreen({ onStartCheck }: { onStartCheck: () => void }) {
  const { cases, hospitals, location } = useServices();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Case[]>([]);
  const [open, setOpen] = useState<Case | null>(null);

  // loadDashboard: stats, 5 recent cases, nearest facility
  const load = useCallback(async () => {
    const [s, r] = await Promise.all([cases.getStats(), cases.getRecent(5)]);
    const pos = location.lastKnown() ?? (IS_DEMO_MODE ? DEMO_POSITION : null);
    if (pos) {
      const [nearest] = await hospitals.findNearest(pos.lat, pos.lon, 1);
      if (nearest) {
        s.nearestFacility = nearest.name;
        s.nearestDistanceKm = nearest.distanceKm;
      }
    }
    setStats(s);
    setRecent(r);
  }, [cases, hospitals, location]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCase = async (id: number) => setOpen((await cases.getById(id)) ?? null);

  const deleteCase = async (id: number) => {
    await cases.delete(id);
    setOpen(null);
    await load();
  };

  if (!stats) return <div className="p-10 text-center text-content-muted">Loading…</div>;
  const empty = stats.totalChecks === 0;
  const usingDemoPosition = !location.lastKnown() && IS_DEMO_MODE;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-6">
      {/* Greeting row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-content">Hello</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-content">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Triage Ready
            </span>
          </div>
          <p className="mt-1 text-sm text-content-muted">How are you feeling today?</p>
        </div>
        <Button icon="add" onClick={onStartCheck} className="px-6 py-3">
          Start a New Check
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="fact_check" label="Total Checks" value={stats.totalChecks} sub="All time" />
        <StatCard
          icon="schedule"
          label="Last Check"
          value={stats.lastCheck ? formatWhen(stats.lastCheck) : 'None yet'}
          sub={stats.lastCheckSeverity ? <SeverityDot color={stats.lastCheckSeverity} /> : undefined}
        />
        <StatCard
          icon="local_hospital"
          label="Nearest Facility"
          value={stats.nearestFacility ?? 'Not located'}
          sub={
            stats.nearestDistanceKm !== null
              ? `${formatDistance(stats.nearestDistanceKm)}${usingDemoPosition ? ' (from Panaji, demo)' : ''}`
              : 'Open the map to find one'
          }
        />
      </div>

      {empty ? (
        <EmptyProfileState onStart={onStartCheck} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="min-w-0 rounded-xl border border-border bg-surface p-5 lg:col-span-2">
            <h2 className="text-lg font-bold text-content">Severity Overview</h2>
            <p className="mb-4 text-xs text-content-muted">Breakdown across {stats.totalChecks} saved checks</p>
            <SeverityPieChart counts={stats.severityCounts} />
          </section>
          <section className="min-w-0 rounded-xl border border-border bg-surface p-5 lg:col-span-3">
            <h2 className="mb-2 text-lg font-bold text-content">Recent Checks</h2>
            <RecentChecksList cases={recent} onOpen={openCase} />
          </section>
        </div>
      )}

      {open && <CaseDialog item={open} onClose={() => setOpen(null)} onDelete={deleteCase} />}
    </div>
  );
}

function SeverityDot({ color }: { color: 'RED' | 'YELLOW' | 'GREEN' }) {
  const label = { RED: 'Red', YELLOW: 'Yellow', GREEN: 'Green' }[color];
  const dot = { RED: 'bg-severity-red', YELLOW: 'bg-severity-yellow', GREEN: 'bg-severity-green' }[color];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label} result
    </span>
  );
}
