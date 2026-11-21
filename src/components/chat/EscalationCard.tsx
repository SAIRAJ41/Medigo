import { Icon } from '../common/Icon';

/** Shown above any Red - High result. */
export function EscalationCard() {
  return (
    <div role="alert" className="rounded-2xl border border-severity-red bg-severity-red-tint p-4">
      <div className="flex items-center gap-2 text-lg font-bold text-severity-red">
        <Icon name="emergency" />
        Seek emergency care now. Call 112.
      </div>
      <p className="mt-1 text-sm text-content">This may be life-threatening. Do not wait for more advice from the app.</p>
      <a
        href="tel:112"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-severity-red px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Icon name="call" className="!text-xl" />
        Call 112 now
      </a>
    </div>
  );
}
