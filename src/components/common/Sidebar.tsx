import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useFocusTrap } from './useFocusTrap';

export type ScreenName = 'dashboard' | 'chat' | 'map' | 'profile' | 'settings' | 'security' | 'help' | 'login' | 'signup';

type NavItem = { screen: ScreenName; label: string; icon: string };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Menu',
    items: [
      { screen: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { screen: 'chat', label: 'New Check', icon: 'chat' },
      { screen: 'map', label: 'Nearest Facility', icon: 'local_hospital' },
      { screen: 'profile', label: 'Profile', icon: 'person' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { screen: 'settings', label: 'Settings', icon: 'settings' },
      { screen: 'security', label: 'Security', icon: 'shield' },
      { screen: 'help', label: 'Get Help', icon: 'help' },
    ],
  },
];

/** Page title for the top bar, taken from the same list as the menu. */
export const SCREEN_TITLES: Partial<Record<ScreenName, string>> = Object.fromEntries(
  GROUPS.flatMap((g) => g.items.map((i) => [i.screen, i.label])),
);

const COLLAPSE_KEY = 'medigo.sidebarCollapsed';

export function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveCollapsed(value: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0');
  } catch {
    /* storage blocked: the choice just isn't remembered */
  }
}

interface PanelProps {
  current: ScreenName;
  collapsed: boolean;
  userName: string;
  userInitials: string;
  onNavigate: (s: ScreenName) => void;
  onSignOut: () => void;
}

/** Shared content of the desktop sidebar and the mobile drawer. */
function Panel({ current, collapsed, userName, userInitials, onNavigate, onSignOut }: PanelProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? 'mt-6 border-t border-border pt-4' : ''}>
            <p className={`mb-2 px-3 text-xs font-medium leading-5 text-content-muted ${collapsed ? 'sr-only' : ''}`}>{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = item.screen === current;
                return (
                  <li key={item.screen}>
                    <button
                      onClick={() => onNavigate(item.screen)}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex h-11 w-full items-center gap-3 rounded-lg text-left text-sm font-medium ${
                        collapsed ? 'justify-center px-0' : 'px-3'
                      } ${active ? 'bg-surface-tint font-semibold text-primary-hover' : 'text-content hover:bg-page active:bg-surface-tint'}`}
                    >
                      <Icon name={item.icon} className={`!text-xl ${active ? 'text-primary' : 'text-content-muted'}`} />
                      <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className={`border-t border-border p-3 ${collapsed ? 'space-y-2' : 'flex items-center gap-3'}`}>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft-blue text-sm font-bold leading-none text-content ${collapsed ? 'mx-auto' : ''}`}
          aria-hidden="true"
        >
          {userInitials}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block text-xs leading-4 text-content-muted">Signed in as</span>
            <span className="block truncate text-sm font-semibold leading-5 text-content">{userName}</span>
          </span>
        )}
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-content-muted hover:bg-page hover:text-content active:bg-surface-tint ${collapsed ? 'mx-auto' : ''}`}
        >
          <Icon name="logout" className="!text-xl" />
        </button>
      </div>
    </>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-xl font-bold leading-none text-primary">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-surface">
        <Icon name="add_circle" className="!text-xl" />
      </span>
      <span className={compact ? 'sr-only' : ''}>MediGo</span>
    </span>
  );
}

interface SidebarProps extends Omit<PanelProps, 'collapsed'> {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/** Fixed left sidebar from md up. The round arrow shrinks it to icons only. */
export function Sidebar({ collapsed, onToggleCollapsed, ...panel }: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex ${
        collapsed ? 'w-[76px]' : 'w-60'
      }`}
    >
      <div className={`relative flex h-16 shrink-0 items-center border-b border-border ${collapsed ? 'justify-center' : 'px-5'}`}>
        <Logo compact={collapsed} />
        {/* 44 px hit area around a 28 px round button sitting on the sidebar edge. */}
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          aria-expanded={!collapsed}
          className="group absolute -right-[22px] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-content-muted group-hover:text-content">
            <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} className="!text-lg" />
          </span>
        </button>
      </div>
      <nav aria-label="Main menu" className="flex min-h-0 flex-1 flex-col">
        <Panel collapsed={collapsed} {...panel} />
      </nav>
    </aside>
  );
}

interface DrawerProps extends Omit<PanelProps, 'collapsed'> {
  open: boolean;
  onClose: () => void;
}

/** Below md: the same menu as an overlay drawer. Closes on choice, outside tap or Escape. Traps focus. */
export function SidebarDrawer({ open, onClose, onNavigate, onSignOut, ...panel }: DrawerProps) {
  const navRef = useRef<HTMLElement>(null);
  useFocusTrap(open, navRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    // Growing past md shows the fixed sidebar, so the drawer closes.
    const wide = window.matchMedia('(min-width: 768px)');
    const onWide = () => wide.matches && onClose();
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 transition-[visibility] duration-200 md:hidden ${open ? 'visible' : 'pointer-events-none invisible'}`}
      aria-hidden={!open}
    >
      <div onClick={onClose} className={`scrim absolute inset-0 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <nav
        ref={navRef}
        aria-label="Main menu"
        className={`absolute left-0 top-0 flex h-full w-64 max-w-[85%] flex-col bg-surface shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border pl-5 pr-2">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-content hover:bg-page active:bg-surface-tint"
          >
            <Icon name="close" className="!text-2xl" />
          </button>
        </div>
        <Panel collapsed={false} onNavigate={onNavigate} onSignOut={onSignOut} {...panel} />
      </nav>
    </div>
  );
}
