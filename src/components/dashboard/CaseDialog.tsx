import { useEffect, useState } from 'react';
import type { Case } from '../../types/Case';
import { formatWhen } from '../../utils/format';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';

interface Props {
  item: Case;
  onClose: () => void;
  onDelete: (id: number) => void;
}

/** Full saved case. Deleting needs a confirmation step. */
export function CaseDialog({ item, onClose, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const steps = item.guidance ? item.guidance.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-content/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Saved check" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <SeverityBadge color={item.severityColor} level={item.severityLevel} />
            <h2 className="mt-3 text-xl font-bold text-content">{item.condition ?? 'Saved check'}</h2>
            <p className="text-xs text-content-muted">{formatWhen(item.timestamp)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-tint">
            <Icon name="close" />
          </button>
        </div>

        <h3 className="mt-5 text-sm font-semibold text-content">What you reported</h3>
        <p className="mt-1 rounded-lg bg-surface-tint p-3 text-sm text-content">{item.inputText || 'Photo only'}</p>

        {steps.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold text-content">First-aid steps</h3>
            <ol className="mt-2 space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-content">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
          {confirming ? (
            <>
              <span className="mr-auto text-sm font-medium text-content">Delete this check?</span>
              <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button variant="outline" icon="delete" onClick={() => onDelete(item.caseId)}>Yes, delete</Button>
            </>
          ) : (
            <>
              <Button variant="outline" icon="delete" onClick={() => setConfirming(true)}>Delete</Button>
              <Button onClick={onClose}>Close</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
