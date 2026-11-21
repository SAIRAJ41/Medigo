import type { ReactNode } from 'react';
import { Icon } from '../common/Icon';

interface Props {
  icon: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

export function StatCard({ icon, label, value, sub }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface-tint p-4">
      <div className="flex items-center gap-2 text-content-muted">
        <Icon name={icon} className="!text-xl text-primary" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold text-content">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-content-muted">{sub}</div>}
    </div>
  );
}
