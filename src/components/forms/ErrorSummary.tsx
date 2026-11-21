import type { MouseEvent } from 'react';
import { Icon } from '../common/Icon';

export interface SummaryItem {
  /** The input id to jump to. Leave out for a form-level message. */
  id?: string;
  message: string;
}

/** Error list announced with role="alert". Uses the text colour, a heavy border and an icon, never colour alone. */
export function ErrorSummary({ items, title = 'Please fix the following' }: { items: SummaryItem[]; title?: string }) {
  if (items.length === 0) return null;

  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.focus();
  };

  return (
    <div role="alert" className="rounded-xl border-2 border-content bg-surface p-4 text-sm leading-5 text-content">
      <p className="flex items-center gap-2 font-semibold">
        <Icon name="error" className="!text-xl" />
        {title}
      </p>
      <ul className="mt-2 space-y-1 pl-7">
        {items.map((item, i) => (
          <li key={item.id ?? `form-${i}`}>
            {item.id ? (
              <a href={`#${item.id}`} onClick={jump(item.id)} className="rounded underline hover:text-primary-hover">
                {item.message}
              </a>
            ) : (
              item.message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
