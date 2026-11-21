/** Shown while mock data is active. Removed by setting IS_DEMO_MODE = false. */
export function DemoBadge() {
  return (
    <span
      className="inline-flex h-8 items-center gap-2 rounded-full border border-content-muted bg-surface px-3 text-xs font-semibold leading-none text-content"
      title="Sample data. No real AI is connected yet."
    >
      <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-primary-hover" />
      <span className="hidden whitespace-nowrap sm:inline">Demo data</span>
      <span className="sr-only sm:hidden">Demo data</span>
    </span>
  );
}
