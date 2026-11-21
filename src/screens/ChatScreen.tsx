import { useEffect, useRef, useState } from 'react';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { ChatStream, type Message } from '../components/chat/ChatStream';
import { SymptomChips } from '../components/chat/SymptomChips';
import { Icon } from '../components/common/Icon';
import { useServices } from '../context/ServicesContext';
import type { TriageOutcome } from '../services/TriageService';
import type { InputType } from '../types/InputType';

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
    const userMsg: Message = { id: nextId.current++, role: 'user', text: text.trim(), image };
    const loadingId = nextId.current++;
    setMessages((m) => [...m, userMsg, { id: loadingId, role: 'loading' }]);
    setText('');
    setImage(null);
    setUsedVoice(false);
    setNotice(null);
    setLoading(true);
    const outcome = await triage.submitQuery({ text: userMsg.text, image: userMsg.image, inputType });
    setMessages((m) => m.filter((x) => x.id !== loadingId).concat({ id: nextId.current++, role: 'assistant', outcome }));
    setLoading(false);
  };

  const save = async (outcome: TriageOutcome) => {
    await triage.saveCase(outcome);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-56px-45px)] w-full max-w-[800px] flex-col">
      {!online && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-border bg-accent p-3 text-sm text-content" role="status">
          <Icon name="cloud_off" className="!text-xl" />
          <span>You are offline. AI replies need internet. Saved first-aid guidance is still available.</span>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <h1 className="text-2xl font-bold text-content">New Check</h1>
        <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-surface-tint p-4 text-sm text-content">
          <div className="mb-1 text-xs font-semibold text-primary">MediGo Assistant</div>
          Describe the injury or symptoms. You can type, speak or add a photo.
        </div>
        {messages.length === 0 && <SymptomChips onPick={setText} />}
        <ChatStream messages={messages} onFindFacility={onFindFacility} onSave={save} />
      </div>

      {notice && (
        <p className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-surface-tint px-3 py-2 text-sm text-content" role="status">
          <Icon name="info" className="!text-lg" />
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
