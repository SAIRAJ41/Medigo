import { useEffect, useRef, useState } from 'react';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { ChatStream, type Message } from '../components/chat/ChatStream';
import { SymptomChips } from '../components/chat/SymptomChips';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { useServices } from '../context/ServicesContext';
import type { TriageOutcome } from '../services/TriageService';
import type { InputType } from '../types/InputType';
import { MAX_HISTORY, type HistoryEntry } from '../types/TriageQuery';
import { getSeverityLabel } from '../types/TriageResult';

/** Earlier messages of this check as text only: no loading bubbles, never old photos. */
function buildHistory(messages: Message[]): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const m of messages) {
    if (m.role === 'user' && m.text.trim()) entries.push({ role: 'user', text: m.text.trim() });
    if (m.role === 'assistant') {
      const r = m.outcome.result;
      entries.push({ role: 'assistant', text: `${r.condition}, ${getSeverityLabel(r)}: ${r.steps.slice(0, 2).join(' ')}` });
    }
  }
  return entries.slice(-MAX_HISTORY);
}

export function ChatScreen({ onFindFacility }: { onFindFacility: () => void }) {
  const { triage, voice } = useServices();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const nextId = useRef(1);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Release the microphone and photo URL when leaving the screen.
  useEffect(() => () => voice.stop(), [voice]);

  const attachImage = (file: File | null) => {
    if (image) URL.revokeObjectURL(image);
    setImage(file ? URL.createObjectURL(file) : null);
  };

  const toggleMic = async () => {
    setNotice(null);
    if (recording) {
      voice.stop();
      return;
    }
    if (!voice.isAvailable()) {
      setNotice('Voice input is not available in this browser. Please type your description.');
      return;
    }
    setRecording(true);
    try {
      const spoken = await voice.transcribe();
      setText((t) => (t ? `${t} ${spoken}` : spoken)); // inserted, never sent automatically
      setUsedVoice(true);
    } catch {
      setNotice('Could not understand the audio. Please try again or type your description.');
    } finally {
      setRecording(false);
    }
  };

  const send = async () => {
    if (loading || (!text.trim() && !image)) return; // a message cannot be sent with no input
    const inputType: InputType = image ? 'PHOTO' : usedVoice ? 'VOICE' : 'TEXT';
    const history = buildHistory(messages); // built before the new message is added
    const userMsg: Message = { id: nextId.current++, role: 'user', text: text.trim(), image };
    const loadingId = nextId.current++;
    setMessages((m) => [...m, userMsg, { id: loadingId, role: 'loading' }]);
    setText('');
    setImage(null);
    setUsedVoice(false);
    setNotice(null);
    setLoading(true);
    const outcome = await triage.submitQuery({ text: userMsg.text, image: userMsg.image, inputType, history });
    setMessages((m) => m.filter((x) => x.id !== loadingId).concat({ id: nextId.current++, role: 'assistant', outcome }));
    setLoading(false);
  };

  // Clears this check so history never mixes two different injuries.
  const startNewCheck = () => {
    if (recording) voice.stop();
    attachImage(null);
    setMessages([]);
    setText('');
    setUsedVoice(false);
    setNotice(null);
  };

  const save = async (outcome: TriageOutcome) => {
    await triage.saveCase(outcome);
  };

  return (
    // 64 px top bar + 48 px footer. Every child shares the same 800 px column and 16 px inset.
    <div className="mx-auto flex h-[calc(100vh-112px)] w-full max-w-[800px] flex-col">
      {!online && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl bg-accent p-4 text-sm leading-5 text-content" role="status">
          <Icon name="cloud_off" className="!text-xl" />
          <span>You are offline. AI replies need internet. Saved first-aid guidance is still available.</span>
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold leading-8 text-content">New Check</h1>
            <p className="mt-1 text-sm text-content-muted">Describe what happened to get first-aid steps.</p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" icon="restart_alt" onClick={startNewCheck} disabled={loading}>
              Start a new check
            </Button>
          )}
        </div>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-surface" aria-hidden="true">
            <Icon name="add_circle" className="!text-xl" />
          </span>
          <div className="min-w-0 space-y-3">
            <div className="flex h-10 items-center text-sm font-semibold text-content">MediGo Assistant</div>
            <div className="rounded-xl rounded-tl-sm bg-surface-tint p-4 text-sm leading-6 text-content">
              Describe the injury or symptoms. You can type, speak or add a photo.
            </div>
            {messages.length === 0 && <SymptomChips onPick={setText} />}
          </div>
        </div>
        <ChatStream messages={messages} onFindFacility={onFindFacility} onSave={save} />
      </div>

      {notice && (
        <p className="mx-4 mb-2 flex items-start gap-2 rounded-lg bg-surface-tint p-3 text-sm leading-5 text-content" role="status">
          <Icon name="info" className="!text-xl" />
          {notice}
        </p>
      )}
      <ChatInputBar
        text={text}
        image={image}
        recording={recording}
        disabled={loading}
        onText={setText}
        onImage={attachImage}
        onMic={toggleMic}
        onSend={send}
      />
    </div>
  );
}
