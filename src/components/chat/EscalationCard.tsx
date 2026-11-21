import { Icon } from '../common/Icon';

/** Shown above any Red - High result. */
export function EscalationCard() {
  return (
    <div role="alert" className="rounded-xl border border-severity-red bg-severity-red-tint p-6">
      <div className="flex items-center gap-2 text-lg font-bold leading-6 text-severity-red">
        <Icon name="emergency" className="!text-xl" />
        Seek emergency care now. Call 112.
      </div>
      <p className="mt-2 text-sm leading-6 text-content">This may be life-threatening. Do not wait for more advice from the app.</p>
      <a
        href="tel:112"
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-severity-red px-4 text-sm font-semibold leading-none text-surface hover:shadow-md active:shadow-none"
      >
        <Icon name="call" className="!text-xl" />
        Call 112 now
      </a>
    </div>
  );
}
