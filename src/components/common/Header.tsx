import { IS_DEMO_MODE } from '../../config/env';
import { DemoBadge } from './DemoBadge';
import { Icon } from './Icon';

interface Props {
  onMenu: () => void;
  onBack?: () => void;
}

/** Top bar: menu (and back), wordmark, demo badge, 112 chip. */
export function Header({ onMenu, onBack }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-border bg-surface px-3 md:px-6">
      <button onClick={onMenu} aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-lg text-content hover:bg-surface-tint">
        <Icon name="menu" />
      </button>
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-lg text-content hover:bg-surface-tint">
          <Icon name="arrow_back" />
        </button>
      )}
      <div className="ml-1 flex items-center gap-1.5 text-lg font-bold text-primary">
        <Icon name="add_circle" className="!text-2xl" />
        MediGo
      </div>
      <div className="ml-auto flex items-center gap-2">
        {IS_DEMO_MODE && <DemoBadge />}
        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-severity-red bg-severity-red-tint px-3 py-1.5 text-xs font-bold text-severity-red"
        >
          <Icon name="call" className="!text-base" />
          112 EMERGENCY
        </a>
        {/* Reserved slot: a profile button will be added here later. */}
      </div>
    </header>
  );
}
