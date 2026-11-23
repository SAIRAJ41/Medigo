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

const ICON_BTN = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg';

/** + attach photo, text field, mic, send. */
export function ChatInputBar({ text, image, recording, disabled, onText, onImage, onMic, onSend }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = (text.trim().length > 0 || image !== null) && !disabled;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSend) onSend();
  };

  return (
    <div className="px-4 pb-4 pt-3">
      {image && (
        <div className="mb-2 flex items-center gap-3">
          <img src={image} alt="Attached" className="h-14 w-14 rounded-lg border border-border object-cover" />
          <button
            onClick={() => onImage(null)}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-content hover:bg-surface active:bg-accent"
          >
            <Icon name="close" className="!text-xl" />
            Remove photo
          </button>
        </div>
      )}
      {/* Focus ring is drawn on the whole bar when the text field has keyboard focus. */}
      <div className="flex items-center gap-2 rounded-xl border border-content-muted bg-surface p-2 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary-hover">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Attach photo"
          className={`${ICON_BTN} text-content hover:bg-surface-tint active:bg-accent`}
        >
          <Icon name="add" className="!text-xl" />
        </button>
        <input
          value={text}
          onChange={(e) => onText(e.target.value)}
          onKeyDown={onKey}
          placeholder={recording ? 'Listening…' : 'Describe what happened'}
          aria-label="Describe what happened"
          className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:outline-none"
        />
        <button
          onClick={onMic}
          aria-label={recording ? 'Stop recording' : 'Speak'}
          aria-pressed={recording}
          className={`${ICON_BTN} ${recording ? 'bg-accent text-content' : 'text-content hover:bg-surface-tint active:bg-accent'}`}
        >
          <Icon name={recording ? 'stop_circle' : 'mic'} className={`!text-xl ${recording ? 'pulse-dot' : ''}`} />
        </button>
        {/* Disabled send is clearly off: grey fill, muted icon, dashed outline (still readable, not faded with opacity). */}
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className={`${ICON_BTN} bg-primary text-surface hover:bg-primary-hover active:bg-primary-hover disabled:cursor-not-allowed disabled:border disabled:border-dashed disabled:border-content-muted disabled:bg-page disabled:text-content-muted`}
        >
          <Icon name="arrow_upward" className="!text-xl" />
        </button>
      </div>
    </div>
  );
}
