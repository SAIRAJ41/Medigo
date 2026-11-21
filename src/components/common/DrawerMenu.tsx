import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useFocusTrap } from './useFocusTrap';

export type ScreenName = 'dashboard' | 'chat' | 'map' | 'profile' | 'login' | 'signup';

const ITEMS: { screen: ScreenName; label: string; icon: string }[] = [
  { screen: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { screen: 'chat', label: 'New Check', icon: 'chat' },
  { screen: 'map', label: 'Nearest Facility', icon: 'local_hospital' },
  { screen: 'profile', label: 'Profile', icon: 'person' },
];

interface Props {
  open: boolean;
  current: ScreenName;
  onNavigate: (s: ScreenName) => void;
  onClose: () => void;
  /** Shows a "Sign out" item at the bottom when given. */
  onSignOut?: () => void;
}

/** Slide-in menu from the left. Closes on backdrop click, Escape or after choosing. Traps focus while open. */
export function DrawerMenu({ open, current, onNavigate, onClose, onSignOut }: Props) {
  const navRef = useRef<HTMLElement>(null);
  useFocusTrap(open, navRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    // `invisible` (after the 200 ms slide) keeps closed-menu links out of the Tab order.
    <div
      className={`fixed inset-0 z-40 transition-[visibility] duration-200 ${open ? 'visible' : 'pointer-events-none invisible'}`}
      aria-hidden={!open}
    >
      <div onClick={onClose} className={`scrim absolute inset-0 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <nav
        ref={navRef}
        aria-label="Main menu"
        className={`absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-surface shadow-xl transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 text-xl font-bold leading-none text-primary">
            <Icon name="add_circle" className="!text-2xl" />
            MediGo
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-content hover:bg-surface-tint active:bg-accent"
          >
            <Icon name="close" className="!text-2xl" />
          </button>
        </div>
        <p className="px-4 pt-4 text-sm text-content-muted">First-aid guidance</p>
        <ul className="flex-1 space-y-1 p-4">
          {ITEMS.map((item) => {
            const active = item.screen === current;
            return (
              <li key={item.screen}>
                <button
                  onClick={() => onNavigate(item.screen)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold ${
                    active ? 'bg-surface-tint text-primary-hover' : 'text-content hover:bg-surface-tint active:bg-accent'
                  }`}
                >
                  <Icon name={item.icon} className="!text-xl" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        {onSignOut && (
          <div className="border-t border-border p-4">
            <button
              onClick={onSignOut}
              className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-content hover:bg-surface-tint active:bg-accent"
            >
              <Icon name="logout" className="!text-xl" />
              Sign out
            </button>
          </div>
        )}
        <p className="border-t border-border p-4 text-xs text-content-muted">Guidance only. Not a substitute for a doctor.</p>
      </nav>
    </div>
  );
}
