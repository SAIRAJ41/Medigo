import { useMemo } from 'react';
import type { Case } from '../../types/Case';

const DAYS = 14;
// Fixed drawing box; the SVG scales to its card width.
const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 32, left: 32 };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const shortDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Checks per day for the last 14 days: one primary line, light area fill, thin grid. Inline SVG, no library. */
export function ChecksChart({ cases }: { cases: Case[] }) {
  const days = useMemo(() => {
    const counts = new Map<string, number>();
    cases.forEach((c) => {
      const k = dayKey(new Date(c.timestamp));
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - i));
      return { date: d, count: counts.get(dayKey(d)) ?? 0 };
    });
  }, [cases]);

  const max = Math.max(...days.map((d) => d.count));
  const top = Math.max(2, max % 2 === 0 ? max : max + 1); // even ceiling so the middle grid line is a whole number
  const ticks = [0, top / 2, top];
  const total = days.reduce((n, d) => n + d.count, 0);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (DAYS - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = days.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`).join(' ');
  const area = `${line} L${x(DAYS - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const busiest = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  const summary =
    total === 0
      ? `No checks in the last ${DAYS} days.`
      : `${total} ${total === 1 ? 'check' : 'checks'} in the last ${DAYS} days. Busiest day ${shortDate(busiest.date)} with ${busiest.count}.`;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={summary}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(t)} dy="0.35em" textAnchor="end" className="fill-content-muted text-[12px]">
              {t}
            </text>
          </g>
        ))}
        <path d={area} className="fill-primary" fillOpacity={0.12} />
        <path d={line} className="stroke-primary" fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {days.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.count)} r={d.count ? 4 : 2.5} className="fill-surface stroke-primary" strokeWidth={2}>
            <title>{`${shortDate(d.date)}: ${d.count} ${d.count === 1 ? 'check' : 'checks'}`}</title>
          </circle>
        ))}
        {days.map((d, i) =>
          i % 3 === 1 || i === DAYS - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-content-muted text-[12px]">
              {i === DAYS - 1 ? 'Today' : shortDate(d.date)}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
