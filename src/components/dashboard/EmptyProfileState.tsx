import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

/** Shown instead of the chart and history when there are no saved cases. */
export function EmptyProfileState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface-tint p-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <Icon name="fact_check" className="text-primary" />
      </div>
      <h2 className="text-lg font-bold text-content">No checks yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-content-muted">
        Your saved checks will appear here, even offline. Start your first check to build your history.
      </p>
      <Button variant="outline" icon="add_circle" className="mt-5" onClick={onStart}>
        Start First Check
      </Button>
    </div>
  );
}
