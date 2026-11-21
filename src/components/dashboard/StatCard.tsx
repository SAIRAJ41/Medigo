import type { ReactNode } from 'react';
import { Icon } from '../common/Icon';

interface Props {
  icon: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

/** Same padding, radius and height as its siblings in the stats row (h-full fills the grid cell). */
export function StatCard({ icon, label, value, sub }: Props) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface-tint p-6">
      <div className="flex items-center gap-2 text-content">
        <Icon name={icon} className="!text-xl text-primary-hover" />
        <span className="text-sm font-medium leading-5">{label}</span>
      </div>
      <div className="mt-3 truncate text-xl font-bold leading-7 text-content">{value}</div>
      {sub && <div className="mt-1 text-xs leading-5 text-content-muted">{sub}</div>}
    </div>
  );
}
