import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { showToast } from '../components/common/Toast';
import { CaseDialog } from '../components/dashboard/CaseDialog';
import { EmptyProfileState } from '../components/dashboard/EmptyProfileState';
import { RecentChecksList } from '../components/dashboard/RecentChecksList';
import { SeverityPieChart } from '../components/dashboard/SeverityPieChart';
import { StatCard } from '../components/dashboard/StatCard';
import { IS_DEMO_MODE } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServicesContext';
import type { Case } from '../types/Case';
import type { DashboardStats } from '../types/DashboardStats';
import { firstName, formatDistance, formatWhen } from '../utils/format';

// Demo only: a reference point in Panaji used until the user's real location is known.
const DEMO_POSITION = { lat: 15.4909, lon: 73.8278 };

export function DashboardScreen({ onStartCheck }: { onStartCheck: () => void }) {
  const { cases, hospitals, location } = useServices();
  const { user } = useAuth();
  const name = user ? firstName(user.fullName) : '';
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
    showToast('Deleted');
    await load();
  };

  if (!stats) return <DashboardSkeleton />;
  const empty = stats.totalChecks === 0;
  const usingDemoPosition = !location.lastKnown() && IS_DEMO_MODE;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-8 md:px-6">
      {/* Greeting row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold leading-10 text-content">{name ? `Hello, ${name}` : 'Hello'}</h1>
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-accent px-3 text-xs font-semibold leading-none text-content">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary-hover" />
              Triage Ready
            </span>
          </div>
          <p className="mt-1 text-sm leading-5 text-content-muted">How are you feeling today?</p>
        </div>
        <Button icon="add" onClick={onStartCheck} className="px-6">
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
          <section className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-6 lg:col-span-2">
            <h2 className="text-lg font-bold leading-7 text-content">Severity Overview</h2>
            <p className="mb-6 mt-1 text-sm leading-5 text-content-muted">Breakdown across {stats.totalChecks} saved checks</p>
            <SeverityPieChart counts={stats.severityCounts} />
          </section>
          <section className="min-w-0 rounded-xl border border-border bg-surface p-6 lg:col-span-3">
            <h2 className="text-lg font-bold leading-7 text-content">Recent Checks</h2>
            <p className="mb-4 mt-1 text-sm leading-5 text-content-muted">Your last {recent.length} saved checks</p>
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
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      {label} result
    </span>
  );
}

/** Placeholder blocks that match the real layout while data loads. */
function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-8 md:px-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="skeleton h-10 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-[132px] !rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="skeleton h-80 !rounded-xl lg:col-span-2" />
        <div className="skeleton h-80 !rounded-xl lg:col-span-3" />
      </div>
    </div>
  );
}
