import type { Case } from '../../types/Case';
import { formatWhen } from '../../utils/format';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';

export function RecentChecksList({ cases, onOpen }: { cases: Case[]; onOpen: (id: number) => void }) {
  return (
    <ul className="divide-y divide-border">
      {cases.map((c) => (
        <li key={c.caseId}>
          <button onClick={() => onOpen(c.caseId)} className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left hover:bg-surface-tint">
            <SeverityBadge color={c.severityColor} level={c.severityLevel} className="shrink-0 justify-center sm:w-32" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-content">{c.condition ?? c.inputText}</div>
              <div className="text-xs text-content-muted">{formatWhen(c.timestamp)}</div>
            </div>
            <Icon name="chevron_right" className="text-content-muted" />
          </button>
        </li>
      ))}
    </ul>
  );
}
