import { useRef, type KeyboardEvent } from 'react';
import { Icon } from '../common/Icon';

interface Props {
  text: string;
  image: string | null;
  recording: boolean;
  disabled: boolean;
  onText: (t: string) => void;
  onImage: (file: File | null) => void;
  onMic: () => void;
  onSend: () => void;
}

/** + attach photo, text field, mic, send. */
export function ChatInputBar({ text, image, recording, disabled, onText, onImage, onMic, onSend }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = (text.trim().length > 0 || image !== null) && !disabled;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSend) onSend();
  };

  return (
    <div className="border-t border-border bg-page px-4 pb-4 pt-3">
      {image && (
        <div className="mb-2 flex items-center gap-2">
          <img src={image} alt="Attached" className="h-14 w-14 rounded-lg border border-border object-cover" />
          <button onClick={() => onImage(null)} className="text-xs font-medium text-content-muted underline">
            Remove photo
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
        <button onClick={() => fileRef.current?.click()} aria-label="Attach photo" className="flex h-11 w-11 items-center justify-center rounded-xl text-content hover:bg-surface-tint">
          <Icon name="add" />
        </button>
        <input
          value={text}
          onChange={(e) => onText(e.target.value)}
          onKeyDown={onKey}
          placeholder={recording ? 'Listening…' : 'Describe what happened'}
          aria-label="Describe what happened"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-content placeholder:text-content-muted focus:outline-none"
        />
        <button
          onClick={onMic}
          aria-label={recording ? 'Stop recording' : 'Speak'}
          aria-pressed={recording}
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${recording ? 'bg-accent text-primary' : 'text-content hover:bg-surface-tint'}`}
        >
          <Icon name={recording ? 'stop_circle' : 'mic'} className={recording ? 'pulse-dot' : ''} />
        </button>
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="arrow_upward" />
        </button>
      </div>
    </div>
  );
}
