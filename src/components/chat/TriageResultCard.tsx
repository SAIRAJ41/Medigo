import { useState } from 'react';
import type { TriageOutcome } from '../../services/TriageService';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';
import { EscalationCard } from './EscalationCard';

interface Props {
  outcome: TriageOutcome;
  onFindFacility: () => void;
  onSave: () => Promise<void>;
}

/** Assistant reply: badge, condition, numbered steps, two actions, disclaimer. */
export function TriageResultCard({ outcome, onFindFacility, onSave }: Props) {
  const { result, status } = outcome;
  const [saved, setSaved] = useState(false);
  const critical = result.severityColor === 'RED' && result.severityLevel === 'HIGH';

  const save = async () => {
    await onSave();
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      {status === 'OFFLINE' && (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-accent p-3 text-sm text-content">
          <Icon name="cloud_off" className="!text-xl" />
          <span>You are offline, so AI analysis is not available. These are the closest saved first-aid steps.</span>
        </div>
      )}
      {status === 'FALLBACK' && (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-accent p-3 text-sm text-content">
          <Icon name="info" className="!text-xl" />
          <span>We could not analyse this reliably, so here is the safe default advice.</span>
        </div>
      )}
      {critical && <EscalationCard />}

      <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge color={result.severityColor} level={result.severityLevel} />
          <h3 className="text-lg font-bold text-content">{result.condition}</h3>
        </div>

        <h4 className="mt-4 text-sm font-semibold text-content">First-aid steps</h4>
        <ol className="mt-2 space-y-2.5">
          {result.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-content">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button icon="local_hospital" onClick={onFindFacility}>
            Find Nearest Facility
          </Button>
          <Button variant="outline" icon={saved ? 'check' : 'bookmark_add'} onClick={save} disabled={saved}>
            {saved ? 'Saved to History' : 'Save to History'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-content-muted">
          This is guidance only, not a substitute for a doctor or emergency care.
        </p>
      </article>
    </div>
  );
}
