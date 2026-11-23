import { useState } from 'react';
import type { TriageOutcome } from '../../services/TriageService';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';
import { showToast } from '../common/Toast';
import { EscalationCard } from './EscalationCard';

interface Props {
  outcome: TriageOutcome;
  onFindFacility: () => void;
  onSave: () => Promise<void>;
  /** True when this result is already in history (reopened conversation). */
  initiallySaved?: boolean;
}

const NOTICE = 'flex items-start gap-2 rounded-xl border border-border bg-soft-cream p-4 text-sm leading-5 text-content';

/** Assistant reply: badge, condition, numbered steps, two actions, disclaimer. */
export function TriageResultCard({ outcome, onFindFacility, onSave, initiallySaved = false }: Props) {
  const { result, status } = outcome;
  const [saved, setSaved] = useState(initiallySaved);
  const critical = result.severityColor === 'RED' && result.severityLevel === 'HIGH';

  const save = async () => {
    await onSave();
    setSaved(true);
    showToast('Saved to history');
  };

  return (
    <div className="space-y-4">
      {status === 'OFFLINE' && (
        <div className={NOTICE}>
          <Icon name="cloud_off" className="!text-xl" />
          <span>You are offline, so AI analysis is not available. These are the closest saved first-aid steps.</span>
        </div>
      )}
      {status === 'FALLBACK' && (
        <div className={NOTICE}>
          <Icon name="info" className="!text-xl" />
          <span>We could not analyse this reliably, so here is the safe default advice.</span>
        </div>
      )}
      {critical && <EscalationCard />}

      <article className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge color={result.severityColor} level={result.severityLevel} />
          <h3 className="text-lg font-bold leading-6 text-content">{result.condition}</h3>
        </div>

        <div className="mt-4 rounded-lg bg-surface-tint p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold leading-5 text-content">
            <Icon name="medical_services" className="!text-xl text-primary-hover" />
            First-aid steps
          </h4>
          {/* 24 px circles share the 24 px line height, so each number sits on the first line of its step. */}
          <ol className="mt-3 space-y-3">
            {result.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-6 text-content">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold leading-none text-surface">
                  {i + 1}
                </span>
                <span className="min-w-0">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button icon="local_hospital" onClick={onFindFacility}>
            Find Nearest Facility
          </Button>
          <Button variant="outline" icon={saved ? 'check' : 'bookmark_add'} onClick={save} disabled={saved}>
            {saved ? 'Saved to History' : 'Save to History'}
          </Button>
        </div>

        <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-content-muted">
          This is guidance only, not a substitute for a doctor or emergency care.
        </p>
      </article>
    </div>
  );
}
