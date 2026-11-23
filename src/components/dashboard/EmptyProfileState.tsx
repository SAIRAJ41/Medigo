import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

/** Shown instead of the chart and history when there are no saved cases. */
export function EmptyProfileState({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-soft-sage">
        <Icon name="fact_check" className="text-content" />
      </div>
      <h2 className="text-lg font-bold leading-6 text-content">No checks yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-content-muted">
        Your saved checks will appear here, even offline. Start your first check to build your history.
      </p>
      <Button variant="outline" icon="add_circle" className="mt-6" onClick={onStart}>
        Start First Check
      </Button>
    </div>
  );
}
