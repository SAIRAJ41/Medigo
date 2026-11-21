import { useEffect, useState } from 'react';
import { Icon } from './Icon';

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Shows a short confirmation such as "Saved to history". */
export function showToast(message: string) {
  listeners.forEach((l) => l(message));
}

/** Mounted once in AppShell. The live region always exists so screen readers announce each toast. */
export function ToastHost() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let id = 0;
    let timer: number | undefined;
    const listener: Listener = (message) => {
      id += 1;
      setToast({ id, message });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 2800);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2">
      {toast && (
        <div key={toast.id} className="toast-in flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-content px-4 text-sm font-medium leading-none text-surface shadow-lg">
          <Icon name="check_circle" className="!text-xl" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
