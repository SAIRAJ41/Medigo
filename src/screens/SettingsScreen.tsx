import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Icon } from '../components/common/Icon';
import { showToast } from '../components/common/Toast';
import { IS_DEMO_MODE, USE_REAL_TRIAGE } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServicesContext';
import { initials } from '../utils/format';

const CARD = 'rounded-xl border border-border bg-surface p-6';

/** One setting: round icon badge, title, explanation, optional control on the right. */
function Row({ icon, title, children, action }: { icon: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft-blue text-content" aria-hidden="true">
        <Icon name={icon} className="!text-xl" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-5 text-content">{title}</h3>
        <div className="mt-1 text-sm leading-6 text-content-muted">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SettingsScreen({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { user } = useAuth();
  const { cases, voice } = useServices();
  const [saved, setSaved] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const count = useCallback(async () => setSaved((await cases.getStats()).totalChecks), [cases]);
  useEffect(() => {
    void count();
  }, [count]);

  const clearAll = async () => {
    setBusy(true);
    try {
      await cases.clearAll();
      showToast('Saved checks cleared');
      await count();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const voiceAvailable = voice.isAvailable();

  return (
    <div className="mx-auto w-full max-w-[880px] space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-3xl font-bold leading-10 text-content">Settings</h1>
        <p className="mt-1 text-sm leading-5 text-content-muted">How MediGo works on this device.</p>
      </div>

      {user && (
        <section className={`${CARD} flex flex-wrap items-center gap-4`} aria-label="Profile">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue text-base font-bold leading-none text-content" aria-hidden="true">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-6 text-content">{user.fullName}</p>
            <p className="truncate text-sm leading-5 text-content-muted">{user.email}</p>
          </div>
          <Button variant="outline" icon="person" onClick={onOpenProfile}>
            Edit profile
          </Button>
        </section>
      )}

      <section className={CARD} aria-labelledby="general-title">
        <h2 id="general-title" className="mb-5 text-lg font-bold leading-7 text-content">
          General
        </h2>
        <div className="divide-y divide-border">
          <Row icon="straighten" title="Distance unit">
            Kilometres (km). MediGo shows all distances in kilometres; this cannot be changed.
          </Row>
          <Row icon="mic" title="Voice input">
            Uses your browser's built-in speech recognition (Indian English). The spoken text is put in the message box and is never sent
            until you press Send. Some browsers need internet for this.{' '}
            <span className="font-semibold text-content">{voiceAvailable ? 'Available in this browser.' : 'Not available in this browser.'}</span>
          </Row>
          <Row icon="database" title="Data mode">
            {IS_DEMO_MODE ? (
              <>
                <span className="font-semibold text-content">Demo data.</span> Saved check history and facilities are sample data kept in
                this browser tab; they reset when the page reloads. AI replies are {USE_REAL_TRIAGE ? 'real (from the MediGo server)' : 'sample replies, no AI is connected'}.
              </>
            ) : (
              <>
                <span className="font-semibold text-content">Real data.</span> Checks are stored on this device.
              </>
            )}
          </Row>
        </div>
      </section>

      <section className={CARD} aria-labelledby="data-title">
        <h2 id="data-title" className="mb-5 text-lg font-bold leading-7 text-content">
          Saved checks
        </h2>
        <Row
          icon="delete_sweep"
          title="Clear saved checks"
          action={
            <Button variant="outline" icon="delete" onClick={() => setConfirming(true)} disabled={!saved}>
              Clear all
            </Button>
          }
        >
          {saved === null ? 'Counting saved checks…' : saved === 0 ? 'There are no saved checks on this device.' : `${saved} saved ${saved === 1 ? 'check' : 'checks'} on this device. Your account is not affected.`}
        </Row>
      </section>

      {confirming && (
        <ConfirmDialog
          title="Clear all saved checks?"
          message={`This deletes ${saved ?? 0} saved ${saved === 1 ? 'check' : 'checks'} from this device. It cannot be undone.`}
          confirmLabel="Yes, clear all"
          busy={busy}
          onConfirm={clearAll}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
