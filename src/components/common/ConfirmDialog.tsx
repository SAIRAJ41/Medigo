import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { useFocusTrap } from './useFocusTrap';

interface Props {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmIcon?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Same frame as the case dialog. Cancel gets focus first; both actions use the outline style. */
export function ConfirmDialog({ title, message, confirmLabel, confirmIcon = 'delete', busy, onConfirm, onCancel }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, panelRef);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, busy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="scrim absolute inset-0" onClick={busy ? undefined : onCancel} />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-xl font-bold leading-7 text-content">
          {title}
        </h2>
        <div id="confirm-dialog-message" className="mt-2 text-sm leading-6 text-content">
          {message}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="outline" icon={confirmIcon} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
