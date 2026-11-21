import { useEffect, useRef, useState } from 'react';
import type { Case } from '../../types/Case';
import { formatWhen } from '../../utils/format';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';
import { useFocusTrap } from '../common/useFocusTrap';

interface Props {
  item: Case;
  onClose: () => void;
  onDelete: (id: number) => void;
}

/** Full saved case. Deleting needs a confirmation step. Focus is trapped inside and returned on close. */
export function CaseDialog({ item, onClose, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, panelRef);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const steps = item.guidance ? item.guidance.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="scrim absolute inset-0" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-dialog-title"
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-surface p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <SeverityBadge color={item.severityColor} level={item.severityLevel} />
            <h2 id="case-dialog-title" className="mt-3 text-xl font-bold leading-7 text-content">
              {item.condition ?? 'Saved check'}
            </h2>
            <p className="mt-1 text-xs leading-5 text-content-muted">{formatWhen(item.timestamp)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-content hover:bg-surface-tint active:bg-accent"
          >
            <Icon name="close" className="!text-xl" />
          </button>
        </div>

        <h3 className="mt-6 text-sm font-semibold leading-5 text-content">What you reported</h3>
        <p className="mt-2 rounded-lg bg-surface-tint p-4 text-sm leading-6 text-content">{item.inputText || 'Photo only'}</p>

        {steps.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold leading-5 text-content">First-aid steps</h3>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-6 text-content">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold leading-none text-surface">
                    {i + 1}
                  </span>
                  <span className="min-w-0">{s}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
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
