import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { ChatStream, type Message } from '../components/chat/ChatStream';
import { HistoryDrawer, HistoryPanel } from '../components/chat/HistoryPanel';
import { SymptomChips } from '../components/chat/SymptomChips';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Icon } from '../components/common/Icon';
import { showToast } from '../components/common/Toast';
import { useServices } from '../context/ServicesContext';
import type { Conversation } from '../types/Conversation';
import type { InputType } from '../types/InputType';
import { MAX_HISTORY, type HistoryEntry } from '../types/TriageQuery';
import { getSeverityLabel } from '../types/TriageResult';

type AssistantMessage = Extract<Message, { role: 'assistant' }>;

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

const PANEL_KEY = 'medigo.historyPanelOpen';
const readPanelOpen = () => {
  try {
    return localStorage.getItem(PANEL_KEY) !== '0';
  } catch {
    return true;
  }
};
const savePanelOpen = (open: boolean) => {
  try {
    localStorage.setItem(PANEL_KEY, open ? '1' : '0');
  } catch {
    /* not remembered */
  }
};

export function ChatScreen({ onFindFacility }: { onFindFacility: () => void }) {
  const { triage, voice, conversations } = useServices();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const nextId = useRef(1);

  // History panel state
  const [conversationId, setConversationId] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null); // the conversation on screen, read after awaits
  const [list, setList] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(readPanelOpen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Release the microphone when leaving the screen.
  useEffect(() => () => voice.stop(), [voice]);

  // History loads from IndexedDB, so it also works offline.
  const refreshList = useCallback(async () => {
    try {
      setList(await conversations.search(query));
    } finally {
      setListLoading(false);
    }
  }, [conversations, query]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const togglePanel = () =>
    setPanelOpen((o) => {
      savePanelOpen(!o);
      return !o;
    });

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

    // Store the user message as it happens; the conversation is created on the first one.
    let convId = conversationId;
    try {
      if (convId === null) {
        convId = (await conversations.create(userMsg.text)).id;
        activeRef.current = convId;
        setConversationId(convId);
      }
      await conversations.addMessage(convId, {
        role: 'user',
        text: userMsg.text,
        inputType,
        result: null,
        outcome: null,
        timestamp: new Date().toISOString(),
      });
      void refreshList();
    } catch {
      setNotice('This message could not be saved on this device. The check still runs.');
    }

    const outcome = await triage.submitQuery({ text: userMsg.text, image: userMsg.image, inputType, history });

    let dbId: number | undefined;
    if (convId !== null) {
      try {
        const stored = await conversations.addMessage(convId, {
          role: 'assistant',
          text: '',
          inputType,
          result: outcome.result,
          outcome: outcome.status,
          timestamp: new Date().toISOString(),
        });
        dbId = stored.id;
      } catch {
        /* the result is still shown; only the stored copy is missing */
      }
    }
    // Only touch the screen if the user is still looking at this conversation.
    if (activeRef.current === convId) {
      setMessages((m) => m.filter((x) => x.id !== loadingId).concat({ id: nextId.current++, role: 'assistant', outcome, dbId }));
    }
    setLoading(false);
    void refreshList();
  };

  /** Clears the screen for a new conversation, so history never mixes two different injuries. */
  const startNewCheck = () => {
    if (recording) voice.stop();
    attachImage(null);
    activeRef.current = null;
    setConversationId(null);
    setMessages([]);
    setText('');
    setUsedVoice(false);
    setNotice(null);
    setLoading(false);
    setDrawerOpen(false);
  };

  /** Opens a stored conversation with all its messages and result cards; follow-ups continue it. */
  const openConversation = async (id: number) => {
    setDrawerOpen(false);
    if (recording) voice.stop();
    attachImage(null);
    activeRef.current = id;
    setConversationId(id);
    setNotice(null);
    setLoading(false);
    const rows = await conversations.getMessages(id);
    if (activeRef.current !== id) return; // another row was clicked meanwhile
    let lastUserText = '';
    const restored: Message[] = [];
    for (const r of rows) {
      if (r.role === 'user') {
        lastUserText = r.text;
        restored.push({ id: nextId.current++, role: 'user', text: r.text, image: null, hadPhoto: r.inputType === 'PHOTO' });
      } else if (r.result && r.outcome) {
        restored.push({
          id: nextId.current++,
          role: 'assistant',
          dbId: r.id,
          saved: r.caseId !== undefined,
          outcome: {
            status: r.outcome,
            result: r.result,
            query: { text: lastUserText, image: null, inputType: r.inputType, context: [], history: [] },
          },
        });
      }
    }
    setMessages(restored);
  };

  // "Save to History" creates the case, linked to this conversation, and marks the stored message as saved.
  const save = async (m: AssistantMessage) => {
    const saved = await triage.saveCase(m.outcome, conversationId);
    if (m.dbId !== undefined) await conversations.markSaved(m.dbId, saved.caseId);
    setMessages((list) => list.map((x) => (x.id === m.id && x.role === 'assistant' ? { ...x, saved: true } : x)));
  };

  const rename = async (id: number, title: string) => {
    await conversations.rename(id, title);
    await refreshList();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await conversations.delete(pendingDelete.id);
      if (pendingDelete.id === conversationId) startNewCheck();
      showToast('Conversation deleted');
      await refreshList();
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const panelProps = {
    conversations: list,
    loading: listLoading,
    activeId: conversationId,
    query,
    onQuery: setQuery,
    onNew: startNewCheck,
    onOpen: (id: number) => void openConversation(id),
    onRename: (id: number, title: string) => void rename(id, title),
    onDelete: setPendingDelete,
  };

  return (
    // 64 px top bar + 48 px footer.
    <div className="flex h-[calc(100vh-112px)]">
      {panelOpen && (
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border bg-surface-tint md:flex" aria-label="Conversation history">
          <HistoryPanel {...panelProps} idPrefix="history-panel" />
        </aside>
      )}
      <HistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <HistoryPanel {...panelProps} idPrefix="history-drawer" />
      </HistoryDrawer>

      {/* Chat column: same centered 800 px column as before. */}
      <div className="min-w-0 flex-1 bg-page">
        <div className="mx-auto flex h-full w-full max-w-[800px] flex-col">
          {!online && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-border bg-soft-cream p-4 text-sm leading-5 text-content" role="status">
              <Icon name="cloud_off" className="!text-xl" />
              <span>You are offline. AI replies need internet. Saved first-aid guidance and your history are still available.</span>
            </div>
          )}

          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open history"
                  className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-content hover:border-content-muted md:hidden"
                >
                  <Icon name="history" className="!text-xl" />
                  History
                </button>
                <button
                  onClick={togglePanel}
                  aria-label={panelOpen ? 'Hide history panel' : 'Show history panel'}
                  aria-expanded={panelOpen}
                  title={panelOpen ? 'Hide history' : 'Show history'}
                  className="hidden h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-content hover:border-content-muted md:flex"
                >
                  <Icon name={panelOpen ? 'left_panel_close' : 'left_panel_open'} className="!text-xl" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold leading-10 text-content">New Check</h1>
                  <p className="mt-1 text-sm text-content-muted">Describe what happened to get first-aid steps.</p>
                </div>
              </div>
              {messages.length > 0 && (
                <Button variant="outline" icon="restart_alt" onClick={startNewCheck}>
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
                <div className="rounded-xl rounded-tl-sm border border-border bg-surface p-4 text-sm leading-6 text-content">
                  Describe the injury or symptoms. You can type, speak or add a photo.
                </div>
                {messages.length === 0 && <SymptomChips onPick={setText} />}
              </div>
            </div>
            <ChatStream messages={messages} onFindFacility={onFindFacility} onSave={save} />
          </div>

          {notice && (
            <p className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm leading-5 text-content" role="status">
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
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this conversation?"
          message={`"${pendingDelete.title}" and its messages will be removed from this device, together with any check saved from it. This cannot be undone.`}
          confirmLabel="Yes, delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
