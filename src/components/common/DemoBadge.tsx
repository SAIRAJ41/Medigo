import { USE_REAL_TRIAGE } from '../../config/env';

/** Shown while mock data is active. Removed by setting IS_DEMO_MODE = false. */
export function DemoBadge() {
  return (
    <span
      className="inline-flex h-8 items-center gap-2 rounded-lg bg-surface-tint px-3 text-xs font-semibold leading-none text-content"
      title={USE_REAL_TRIAGE ? 'Sample history. AI replies are real.' : 'Sample data. No real AI is connected yet.'}
    >
      <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-primary-hover" />
      <span className="hidden whitespace-nowrap sm:inline">Demo data</span>
      <span className="sr-only sm:hidden">Demo data</span>
    </span>
  );
}
