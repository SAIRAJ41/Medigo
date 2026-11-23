import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { showToast } from '../components/common/Toast';
import { CaseDialog } from '../components/dashboard/CaseDialog';
import { EmptyProfileState } from '../components/dashboard/EmptyProfileState';
import { RecentChecksList } from '../components/dashboard/RecentChecksList';
import { ChecksChart } from '../components/dashboard/ChecksChart';
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
  const [all, setAll] = useState<Case[]>([]);
  const [open, setOpen] = useState<Case | null>(null);

  // loadDashboard: stats, 5 recent cases, nearest facility
  const load = useCallback(async () => {
    const [s, r, a] = await Promise.all([cases.getStats(), cases.getRecent(5), cases.getAll()]);
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
    setAll(a);
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
  const last = recent[0];
  const usingDemoPosition = !location.lastKnown() && IS_DEMO_MODE;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-10 text-content">Dashboard</h1>
          <p className="mt-1 text-sm leading-5 text-content-muted">
            {name ? `Hello, ${name}. ` : ''}Here is a summary of your saved checks.
          </p>
        </div>
        <Button icon="add" onClick={onStartCheck} className="px-6">
          Start a New Check
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard hero icon="fact_check" label="Total Checks" value={stats.totalChecks} sub="All time, on this device" />
        <StatCard
          icon="schedule"
          label="Last Check"
          badge="cream"
          value={stats.lastCheck ? formatWhen(stats.lastCheck) : 'None yet'}
          sub={last ? <SeverityBadge color={last.severityColor} level={last.severityLevel} /> : 'Start a check to see it here'}
        />
        <StatCard
          icon="local_hospital"
          label="Nearest Facility"
          badge="sage"
          wrap
          value={stats.nearestFacility ?? 'Not located'}
          sub={
            stats.nearestDistanceKm !== null
              ? `${formatDistance(stats.nearestDistanceKm)}${usingDemoPosition ? ' (from Panaji, demo)' : ''}`
              : 'Open the map to find one'
          }
        />
        <StatCard icon="emergency" label="Red Cases" value={stats.severityCounts.RED} sub="Checks rated Red" />
      </div>

      {empty ? (
        <EmptyProfileState onStart={onStartCheck} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-5">
            <section className={`${CARD} lg:col-span-3`} aria-labelledby="chart-title">
              <h2 id="chart-title" className={CARD_TITLE}>Checks over time</h2>
              <p className={CARD_SUB}>Checks per day, last 14 days</p>
              <ChecksChart cases={all} />
            </section>
            <section className={`${CARD} lg:col-span-2`} aria-labelledby="severity-title">
              <h2 id="severity-title" className={CARD_TITLE}>Severity Overview</h2>
              <p className={CARD_SUB}>Across {stats.totalChecks} saved checks</p>
              <SeverityPieChart counts={stats.severityCounts} />
            </section>
          </div>
          <section className={CARD} aria-labelledby="recent-title">
            <h2 id="recent-title" className={CARD_TITLE}>Recent Checks</h2>
            <p className="mb-4 mt-1 text-sm leading-5 text-content-muted">Your last {recent.length} saved checks</p>
            <RecentChecksList cases={recent} onOpen={openCase} />
          </section>
        </>
      )}

      {open && <CaseDialog item={open} onClose={() => setOpen(null)} onDelete={deleteCase} />}
    </div>
  );
}

const CARD = 'min-w-0 rounded-xl border border-border bg-surface p-6';
const CARD_TITLE = 'text-lg font-bold leading-7 text-content';
const CARD_SUB = 'mb-6 mt-1 text-sm leading-5 text-content-muted';

/** Placeholder blocks that match the real layout while data loads. */
function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="skeleton h-10 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-[132px] !rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="skeleton h-80 !rounded-xl lg:col-span-3" />
        <div className="skeleton h-80 !rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
