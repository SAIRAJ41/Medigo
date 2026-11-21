import type { Case } from '../../types/Case';
import { formatWhen } from '../../utils/format';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';

/** Badge, title/time and chevron sit on three shared grid columns in every row. */
export function RecentChecksList({ cases, onOpen }: { cases: Case[]; onOpen: (id: number) => void }) {
  return (
    <ul className="divide-y divide-border">
      {cases.map((c) => (
        <li key={c.caseId}>
          <button
            onClick={() => onOpen(c.caseId)}
            className="grid w-full grid-cols-[10rem_minmax(0,1fr)_auto] items-center gap-4 rounded-lg px-2 py-3 text-left hover:bg-surface-tint active:bg-accent"
          >
            <span className="flex">
              <SeverityBadge color={c.severityColor} level={c.severityLevel} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-5 text-content">{c.condition ?? c.inputText}</span>
              <span className="block text-xs leading-5 text-content-muted">{formatWhen(c.timestamp)}</span>
            </span>
            <Icon name="chevron_right" className="!text-xl text-content-muted" />
          </button>
        </li>
      ))}
    </ul>
  );
}
