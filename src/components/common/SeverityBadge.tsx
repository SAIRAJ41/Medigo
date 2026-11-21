import type { SeverityColor } from '../../types/SeverityColor';
import type { SeverityLevel } from '../../types/SeverityLevel';
import { getSeverityLabel } from '../../types/TriageResult';
import { Icon } from './Icon';

const ICON: Record<SeverityColor, string> = { RED: 'error', YELLOW: 'warning', GREEN: 'check_circle' };

// Tint badges get a border in the solid colour so meaning never depends on colour alone.
// Yellow uses dark text and a dark icon: yellow on its own tint is far below 3:1.
const TINT: Record<SeverityColor, string> = {
  RED: 'bg-severity-red-tint text-severity-red border-severity-red',
  YELLOW: 'bg-severity-yellow-tint text-content border-severity-yellow',
  GREEN: 'bg-severity-green-tint text-severity-green border-severity-green',
};
// White text only on red and green solid; yellow uses dark text.
const SOLID: Record<SeverityColor, string> = {
  RED: 'bg-severity-red text-surface border-severity-red',
  YELLOW: 'bg-severity-yellow text-content border-severity-yellow',
  GREEN: 'bg-severity-green text-surface border-severity-green',
};

interface Props {
  color: SeverityColor;
  level: SeverityLevel;
  variant?: 'tint' | 'solid';
  className?: string;
}

/** Always shows an icon AND a text label such as "Red - High". Fixed 32 px height like every chip. */
export function SeverityBadge({ color, level, variant = 'tint', className = '' }: Props) {
  const style = variant === 'solid' ? SOLID[color] : TINT[color];
  return (
    <span
      className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-xs font-semibold leading-none ${style} ${className}`}
    >
      <Icon name={ICON[color]} className="!text-base" />
      {getSeverityLabel({ severityColor: color, severityLevel: level })}
    </span>
  );
}
