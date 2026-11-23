import type { ReactNode } from 'react';
import { Icon } from '../common/Icon';

interface Props {
  icon: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Solid primary card with white text (one per row). */
  hero?: boolean;
  /** Fill of the round icon badge on light cards. */
  badge?: 'blue' | 'sage' | 'cream';
  /** Long values (facility names) may wrap to two lines instead of one. */
  wrap?: boolean;
}

const BADGE = { blue: 'bg-soft-blue', sage: 'bg-soft-sage', cream: 'bg-soft-cream' };

/** Stat tile: label and round icon badge on top, big value, small note. h-full keeps the row even. */
export function StatCard({ icon, label, value, sub, hero, badge = 'blue', wrap }: Props) {
  return (
    <div className={`flex h-full flex-col rounded-xl p-5 ${hero ? 'bg-primary text-surface' : 'border border-border bg-surface text-content'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`pt-1 text-sm font-medium leading-5 ${hero ? 'text-surface' : 'text-content-muted'}`}>{label}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${hero ? 'bg-surface text-primary-hover' : `${BADGE[badge]} text-content`}`}
          aria-hidden="true"
        >
          <Icon name={icon} className="!text-xl" />
        </span>
      </div>
      <div
        className={`mt-2 font-bold ${wrap ? 'line-clamp-2 text-lg leading-6' : hero ? 'truncate text-3xl leading-9' : 'truncate text-2xl leading-8'}`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
      {sub && <div className={`mt-auto pt-2 text-xs leading-5 ${hero ? 'text-surface' : 'text-content-muted'}`}>{sub}</div>}
    </div>
  );
}
