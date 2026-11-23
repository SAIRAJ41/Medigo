import { IS_DEMO_MODE } from '../../config/env';
import { DemoBadge } from './DemoBadge';
import { Icon } from './Icon';

interface Props {
  /** Page title for signed-in screens. Signed out, the MediGo wordmark is shown instead. */
  title?: string;
  /** Opens the drawer below md. Leave out on Login / Sign Up. */
  onMenu?: () => void;
  onBack?: () => void;
  /** Signed-in user's initials and name for the round profile button. */
  userInitials?: string;
  userName?: string;
  onProfile?: () => void;
  profileActive?: boolean;
}

const NAV_BTN = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-content hover:bg-surface-tint active:bg-accent';

/** Slim top bar: menu (mobile), back, page title; Demo badge, 112 chip and profile button on the right. */
export function Header({ title, onMenu, onBack, userInitials, userName, onProfile, profileActive }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-4 md:px-6">
      {onMenu && (
        <button onClick={onMenu} aria-label="Open menu" className={`${NAV_BTN} md:hidden`}>
          <Icon name="menu" className="!text-2xl" />
        </button>
      )}
      {onBack && (
        <button onClick={onBack} aria-label="Back to Dashboard" title="Back" className={NAV_BTN}>
          <Icon name="arrow_back" className="!text-2xl" />
        </button>
      )}
      {title ? (
        // The page itself has the h1; this is a quiet label, hidden on phones to leave room for the 112 chip.
        <p className="ml-1 hidden min-w-0 truncate text-base font-semibold leading-6 text-content sm:block">{title}</p>
      ) : (
        <div className="flex items-center gap-2 text-xl font-bold leading-none text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-surface">
            <Icon name="add_circle" className="!text-xl" />
          </span>
          MediGo
        </div>
      )}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {IS_DEMO_MODE && <DemoBadge />}
        <a
          href="tel:112"
          aria-label="Call 112 emergency"
          className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-severity-red-tint px-3 text-xs font-bold leading-none text-severity-red hover:underline"
        >
          <Icon name="call" className="!text-lg" />
          112 EMERGENCY
        </a>
        {onProfile && userInitials && (
          <button
            onClick={onProfile}
            aria-label={`Profile${userName ? `: ${userName}` : ''}`}
            aria-current={profileActive ? 'page' : undefined}
            title="Profile"
            className={`hidden h-11 w-11 items-center justify-center rounded-full bg-soft-blue text-sm font-bold leading-none text-content hover:bg-accent sm:flex ${
              profileActive ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
          >
            {userInitials}
          </button>
        )}
      </div>
    </header>
  );
}
