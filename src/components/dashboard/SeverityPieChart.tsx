import { useEffect, useState } from 'react';
import type { SeverityColor } from '../../types/SeverityColor';
import { Icon } from '../common/Icon';

// Bar colours come only from the three severity tokens. Icon + label carry the meaning, never colour alone.
// The yellow icon uses the text colour: severity yellow on white is below 3:1.
const ROWS: { color: SeverityColor; label: string; icon: string; iconClass: string; bar: string }[] = [
  { color: 'RED', label: 'Red', icon: 'error', iconClass: 'text-severity-red', bar: 'bg-severity-red' },
  { color: 'YELLOW', label: 'Yellow', icon: 'warning', iconClass: 'text-content', bar: 'bg-severity-yellow' },
  { color: 'GREEN', label: 'Green', icon: 'check_circle', iconClass: 'text-severity-green', bar: 'bg-severity-green' },
];

const checks = (n: number) => `${n} ${n === 1 ? 'check' : 'checks'}`;

/**
 * Severity breakdown as three horizontal bars (Red, Yellow, Green): label and count on one line, bar below.
 * The name is kept from the earlier donut chart so callers do not change.
 */
export function SeverityPieChart({ counts }: { counts: Record<SeverityColor, number> }) {
  const total = counts.RED + counts.YELLOW + counts.GREEN;

  // Bars grow from 0 after the first paint (300 ms). The transition is off under prefers-reduced-motion.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const summary = `Severity breakdown of ${checks(total)}: Red ${counts.RED}, Yellow ${counts.YELLOW}, Green ${counts.GREEN}.`;

  return (
    <div role="img" aria-label={summary} className="space-y-6">
      {ROWS.map((r) => {
        const n = counts[r.color];
        const pct = total ? (n / total) * 100 : 0;
        return (
          <div key={r.color}>
            <div className="flex items-center justify-between gap-3 text-sm leading-5">
              <span className="flex items-center gap-2 font-semibold text-content">
                <Icon name={r.icon} className={`!text-xl ${r.iconClass}`} />
                {r.label}
              </span>
              <span className="tabular-nums text-content">
                {checks(n)} <span className="ml-1 font-semibold">{Math.round(pct)}%</span>
              </span>
            </div>
            <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-surface-tint">
              <span
                className={`block h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${r.bar}`}
                style={{ width: grown ? `${pct}%` : '0%', minWidth: n > 0 ? 4 : 0 }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
