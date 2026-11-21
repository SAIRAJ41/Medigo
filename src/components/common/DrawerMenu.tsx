import { useEffect } from 'react';
import { Icon } from './Icon';

export type ScreenName = 'dashboard' | 'chat' | 'map';

const ITEMS: { screen: ScreenName; label: string; icon: string }[] = [
  { screen: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { screen: 'chat', label: 'New Check', icon: 'chat' },
  { screen: 'map', label: 'Nearest Facility', icon: 'local_hospital' },
];

interface Props {
  open: boolean;
  current: ScreenName;
  onNavigate: (s: ScreenName) => void;
  onClose: () => void;
}

/** Slide-in menu from the left. Closes on backdrop click, Escape or after choosing. */
export function DrawerMenu({ open, current, onNavigate, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-content/30 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <nav
        aria-label="Main menu"
        className={`absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-surface shadow-xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xl font-bold text-primary">
              <Icon name="add_circle" className="!text-2xl" />
              MediGo
            </div>
            <p className="mt-1 text-sm text-content-muted">First-aid guidance</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-tint">
            <Icon name="close" />
          </button>
        </div>
        <ul className="flex-1 space-y-1 p-3">
          {ITEMS.map((item) => {
            const active = item.screen === current;
            return (
              <li key={item.screen}>
                <button
                  onClick={() => onNavigate(item.screen)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${active ? 'bg-surface-tint text-primary' : 'text-content hover:bg-surface-tint'}`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-border p-4 text-xs text-content-muted">Guidance only. Not a substitute for a doctor.</p>
      </nav>
    </div>
  );
}
