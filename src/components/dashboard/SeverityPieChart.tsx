import type { SeverityColor } from '../../types/SeverityColor';

const R = 44;
const C = 2 * Math.PI * R;

// Chart colours come only from the three severity tokens.
const SEGMENTS: { color: SeverityColor; label: string; stroke: string; dot: string }[] = [
  { color: 'GREEN', label: 'Green', stroke: 'stroke-severity-green', dot: 'bg-severity-green' },
  { color: 'YELLOW', label: 'Yellow', stroke: 'stroke-severity-yellow', dot: 'bg-severity-yellow' },
  { color: 'RED', label: 'Red', stroke: 'stroke-severity-red', dot: 'bg-severity-red' },
];

/** Donut chart with a legend that shows counts and percentages. */
export function SeverityPieChart({ counts }: { counts: Record<SeverityColor, number> }) {
  const total = counts.RED + counts.YELLOW + counts.GREEN;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 120 120" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Severity breakdown chart">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="16" className="stroke-border" />
        {SEGMENTS.map((s) => {
          const len = total ? (counts[s.color] / total) * C : 0;
          const el = (
            <circle
              key={s.color}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              strokeWidth="16"
              className={s.stroke}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
        <g className="rotate-90 origin-center">
          <text x="60" y="58" textAnchor="middle" className="fill-content text-[22px] font-bold">
            {total}
          </text>
          <text x="60" y="74" textAnchor="middle" className="fill-content-muted text-[9px]">
            Evaluated
          </text>
        </g>
      </svg>
      <ul className="w-full space-y-2.5 text-sm">
        {SEGMENTS.map((s) => {
          const n = counts[s.color];
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <li key={s.color} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              <span className="font-medium text-content">{s.label}</span>
              <span className="ml-auto text-content-muted">
                {n} {n === 1 ? 'check' : 'checks'}
              </span>
              <span className="w-12 rounded-md bg-surface-tint px-1.5 py-0.5 text-center text-xs font-semibold text-content">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
