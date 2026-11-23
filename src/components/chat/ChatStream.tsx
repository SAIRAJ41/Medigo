import { useEffect, useRef } from 'react';
import type { TriageOutcome } from '../../services/TriageService';
import { Icon } from '../common/Icon';
import { TriageResultCard } from './TriageResultCard';

export type Message =
  /** hadPhoto: a photo was attached but is not stored (reopened conversations). */
  | { id: number; role: 'user'; text: string; image: string | null; hadPhoto?: boolean }
  /** dbId: the stored message, used to link a saved case. saved: already saved to history. */
  | { id: number; role: 'assistant'; outcome: TriageOutcome; dbId?: number; saved?: boolean }
  | { id: number; role: 'loading' };

interface Props {
  messages: Message[];
  onFindFacility: () => void;
  onSave: (message: Extract<Message, { role: 'assistant' }>) => Promise<void>;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function ChatStream({ messages, onFindFacility, onSave }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        if (m.role === 'user') {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-xl rounded-br-sm bg-primary p-4 text-sm leading-6 text-surface">
                {m.image && <img src={m.image} alt="Attached" className="mb-2 h-28 w-28 rounded-lg object-cover" />}
                {!m.image && m.hadPhoto && (
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold">
                    <Icon name="image" className="!text-base" />
                    Photo attached (not stored)
                  </p>
                )}
                {m.text && <p>{m.text}</p>}
              </div>
            </div>
          );
        }
        if (m.role === 'loading') {
          return (
            <div key={m.id} className="inline-flex flex-col rounded-xl rounded-bl-sm border border-border bg-surface px-4 py-2 text-sm text-content" role="status">
              <span className="flex h-6 items-center gap-2">
                <span className="flex items-center gap-1" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="pulse-dot h-2 w-2 rounded-full bg-primary-hover" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </span>
                Analyzing
              </span>
              <span className="leading-6">This can take up to a minute.</span>
            </div>
          );
        }
        return (
          <TriageResultCard key={m.id} outcome={m.outcome} initiallySaved={!!m.saved} onFindFacility={onFindFacility} onSave={() => onSave(m)} />
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
