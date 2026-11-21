import type { SeverityColor } from '../../types/SeverityColor';
import type { SeverityLevel } from '../../types/SeverityLevel';
import { getSeverityLabel } from '../../types/TriageResult';
import { Icon } from './Icon';

const ICON: Record<SeverityColor, string> = { RED: 'error', YELLOW: 'warning', GREEN: 'check_circle' };

// Tint badges get a border in the solid colour so meaning never depends on colour alone.
const TINT: Record<SeverityColor, string> = {
  RED: 'bg-severity-red-tint text-severity-red border-severity-red',
  YELLOW: 'bg-severity-yellow-tint text-content border-severity-yellow',
  GREEN: 'bg-severity-green-tint text-severity-green border-severity-green',
};
// White text only on red and green solid; yellow uses dark text.
const SOLID: Record<SeverityColor, string> = {
  RED: 'bg-severity-red text-white border-severity-red',
  YELLOW: 'bg-severity-yellow text-content border-severity-yellow',
  GREEN: 'bg-severity-green text-white border-severity-green',
};

interface Props {
  color: SeverityColor;
  level: SeverityLevel;
  variant?: 'tint' | 'solid';
  className?: string;
}

/** Always shows an icon AND a text label such as "Red - High". */
export function SeverityBadge({ color, level, variant = 'tint', className = '' }: Props) {
  const style = variant === 'solid' ? SOLID[color] : TINT[color];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${style} ${className}`}
    >
      <Icon name={ICON[color]} className="!text-base" />
      {getSeverityLabel({ severityColor: color, severityLevel: level })}
    </span>
  );
}
