import { useEffect, useRef } from 'react';
import type { TriageOutcome } from '../../services/TriageService';
import { TriageResultCard } from './TriageResultCard';

export type Message =
  | { id: number; role: 'user'; text: string; image: string | null }
  | { id: number; role: 'assistant'; outcome: TriageOutcome }
  | { id: number; role: 'loading' };

interface Props {
  messages: Message[];
  onFindFacility: () => void;
  onSave: (outcome: TriageOutcome) => Promise<void>;
}

export function ChatStream({ messages, onFindFacility, onSave }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        if (m.role === 'user') {
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent p-3 text-sm text-content">
                {m.image && <img src={m.image} alt="Attached" className="mb-2 h-28 w-28 rounded-lg object-cover" />}
                {m.text && <p>{m.text}</p>}
              </div>
            </div>
          );
        }
        if (m.role === 'loading') {
          return (
            <div key={m.id} className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-surface-tint px-4 py-3 text-sm text-content-muted" role="status">
              Analyzing
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </span>
            </div>
          );
        }
        return (
          <TriageResultCard key={m.id} outcome={m.outcome} onFindFacility={onFindFacility} onSave={() => onSave(m.outcome)} />
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
