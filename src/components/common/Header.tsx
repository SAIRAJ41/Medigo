import { IS_DEMO_MODE } from '../../config/env';
import { DemoBadge } from './DemoBadge';
import { Icon } from './Icon';

interface Props {
  onMenu: () => void;
  onBack?: () => void;
}

const NAV_BTN = 'flex h-10 w-10 items-center justify-center rounded-lg text-content hover:bg-surface-tint active:bg-accent';

/** Top bar: menu (and back), wordmark, demo badge, 112 chip. Every item sits on one centerline. */
export function Header({ onMenu, onBack }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-surface px-4 md:px-6">
      <button onClick={onMenu} aria-label="Open menu" className={NAV_BTN}>
        <Icon name="menu" className="!text-2xl" />
      </button>
      {onBack && (
        <button onClick={onBack} aria-label="Back" className={NAV_BTN}>
          <Icon name="arrow_back" className="!text-2xl" />
        </button>
      )}
      <div className="ml-2 flex h-10 items-center gap-2 text-xl font-bold leading-none text-primary">
        <Icon name="add_circle" className="!text-2xl" />
        MediGo
      </div>
      <div className="ml-auto flex items-center gap-3">
        {IS_DEMO_MODE && <DemoBadge />}
        <a
          href="tel:112"
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-severity-red bg-severity-red-tint px-4 text-xs font-bold leading-none text-severity-red hover:bg-surface active:bg-surface"
        >
          <Icon name="call" className="!text-xl" />
          112 EMERGENCY
        </a>
        {/* Reserved slot: a profile button will be added here later. */}
      </div>
    </header>
  );
}
