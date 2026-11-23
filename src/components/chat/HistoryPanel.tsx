import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Conversation } from '../../types/Conversation';
import { Icon } from '../common/Icon';
import { SeverityBadge } from '../common/SeverityBadge';
import { useFocusTrap } from '../common/useFocusTrap';

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Today, Yesterday, Previous 7 days, Older (by last activity). Empty groups are left out. */
function groupByDate(list: Conversation[]): { label: string; items: Conversation[] }[] {
  const today = startOfDay(new Date());
  const groups = [
    { label: 'Today', items: [] as Conversation[] },
    { label: 'Yesterday', items: [] as Conversation[] },
    { label: 'Previous 7 days', items: [] as Conversation[] },
    { label: 'Older', items: [] as Conversation[] },
  ];
  for (const c of list) {
    const day = startOfDay(new Date(c.updatedAt));
    const idx = day >= today ? 0 : day >= today - DAY ? 1 : day >= today - 7 * DAY ? 2 : 3;
    groups[idx].items.push(c);
  }
  return groups.filter((g) => g.items.length > 0);
}

interface Props {
  conversations: Conversation[];
  loading: boolean;
  activeId: number | null;
  query: string;
  onQuery: (q: string) => void;
  onNew: () => void;
  onOpen: (id: number) => void;
  onRename: (id: number, title: string) => void;
  onDelete: (conversation: Conversation) => void;
  /** Keeps element ids unique when the panel and the drawer are both in the page. */
  idPrefix?: string;
}

/** History list: New check, title search, conversations grouped by date. Used in the side panel and the mobile drawer. */
export function HistoryPanel({ conversations, loading, activeId, query, onQuery, onNew, onOpen, onRename, onDelete, idPrefix = 'history' }: Props) {
  const groups = groupByDate(conversations);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-3">
        <button
          onClick={onNew}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold leading-none text-surface hover:bg-primary-hover"
        >
          <Icon name="add" className="!text-xl" />
          New check
        </button>
        <div className="flex h-11 items-center gap-2 rounded-lg border border-content-muted bg-surface px-3 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary-hover">
          <Icon name="search" className="!text-xl text-content-muted" />
          <label htmlFor={`${idPrefix}-search`} className="sr-only">
            Search conversations by title
          </label>
          <input
            id={`${idPrefix}-search`}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-busy={loading}>
        {loading ? (
          <div className="space-y-2 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="px-2 pt-6 text-center text-sm leading-6 text-content-muted">
            {query.trim() ? `No conversations match "${query.trim()}".` : 'No saved checks yet. Your conversations appear here.'}
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.label} className="mt-3 first:mt-0" aria-label={g.label}>
              <h3 className="px-2 pb-1 text-xs font-semibold leading-5 text-content-muted">{g.label}</h3>
              <ul className="space-y-1">
                {g.items.map((c) => (
                  <HistoryRow
                    key={c.id}
                    idPrefix={idPrefix}
                    conversation={c}
                    active={c.id === activeId}
                    onOpen={() => onOpen(c.id)}
                    onRename={(t) => onRename(c.id, t)}
                    onDelete={() => onDelete(c)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

interface RowProps {
  idPrefix: string;
  conversation: Conversation;
  active: boolean;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

/** One conversation: title + latest severity, a "..." menu with Rename and Delete. Active row has a primary left bar. */
function HistoryRow({ idPrefix, conversation: c, active, onOpen, onRename, onDelete }: RowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false); // Escape: the blur that follows must not save

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (editing) {
      cancelled.current = false;
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    if (cancelled.current) return;
    setEditing(false);
    if (draft.trim() && draft.trim() !== c.title) onRename(draft.trim());
    else setDraft(c.title);
  };

  return (
    <li
      className={`group relative flex items-stretch rounded-lg ${active ? 'bg-surface' : 'hover:bg-surface'}`}
    >
      {active && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" aria-hidden="true" />}
      {editing ? (
        <div className="min-w-0 flex-1 py-2 pl-3 pr-1">
          <label htmlFor={`${idPrefix}-rename-${c.id}`} className="sr-only">
            New title
          </label>
          <input
            ref={inputRef}
            id={`${idPrefix}-rename-${c.id}`}
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                cancelled.current = true;
                setDraft(c.title);
                setEditing(false);
              }
            }}
            className="h-11 w-full rounded-lg border border-content-muted bg-surface px-2 text-sm text-content"
          />
        </div>
      ) : (
        <button
          onClick={onOpen}
          aria-current={active ? 'true' : undefined}
          className="min-w-0 flex-1 rounded-lg py-2 pl-3 pr-1 text-left"
        >
          <span className={`block truncate text-sm leading-5 text-content ${active ? 'font-semibold' : 'font-medium'}`}>{c.title}</span>
          {c.lastSeverityColor && c.lastSeverityLevel && (
            <SeverityBadge size="sm" color={c.lastSeverityColor} level={c.lastSeverityLevel} className="mt-1" />
          )}
        </button>
      )}
      <div ref={menuRef} className="relative shrink-0 self-center">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={`More actions for ${c.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-content-muted hover:bg-surface-tint hover:text-content"
        >
          <Icon name="more_horiz" className="!text-xl" />
        </button>
        {menuOpen && (
          <div role="menu" className="absolute right-0 top-12 z-20 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg">
            <MenuItem
              icon="edit"
              onClick={() => {
                setMenuOpen(false);
                setDraft(c.title);
                setEditing(true);
              }}
            >
              Rename
            </MenuItem>
            <MenuItem
              icon="delete"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              Delete
            </MenuItem>
          </div>
        )}
      </div>
    </li>
  );
}

function MenuItem({ icon, onClick, children }: { icon: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-content hover:bg-surface-tint"
    >
      <Icon name={icon} className="!text-xl text-content-muted" />
      {children}
    </button>
  );
}

/** Below md: the history list as an overlay drawer from the left. Closes on outside tap or Escape. Traps focus. */
export function HistoryDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 transition-[visibility] duration-200 md:hidden ${open ? 'visible' : 'pointer-events-none invisible'}`}
      aria-hidden={!open}
    >
      <div onClick={onClose} className={`scrim absolute inset-0 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Conversation history"
        className={`absolute left-0 top-0 flex h-full w-[300px] max-w-[85%] flex-col bg-surface-tint shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border pl-4 pr-2">
          <h2 className="text-base font-semibold text-content">History</h2>
          <button
            onClick={onClose}
            aria-label="Close history"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-content hover:bg-surface"
          >
            <Icon name="close" className="!text-2xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
