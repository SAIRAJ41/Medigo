/** Shown while mock data is active. Removed by setting IS_DEMO_MODE = false. */
export function DemoBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-tint px-2.5 py-1 text-xs font-medium text-content-muted"
      title="Sample data. No real AI is connected yet."
    >
      <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
      <span className="hidden whitespace-nowrap sm:inline">Demo data</span>
      <span className="sr-only sm:hidden">Demo data</span>
    </span>
  );
}
