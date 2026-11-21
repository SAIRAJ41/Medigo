/* Minimal typing for the browser speech API (not in the default TypeScript DOM types). */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

const getCtor = (): RecognitionCtor | null => {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/**
 * Speech to text using the browser's recognizer. Transcribed text is returned,
 * never sent automatically. Some browsers need internet for recognition.
 */
export class VoiceService {
  private recognition: SpeechRecognitionLike | null = null;

  constructor(private readonly language = 'en-IN') {}

  isAvailable(): boolean {
    return getCtor() !== null;
  }

  /** Starts listening. Resolves with the text, or rejects if nothing could be transcribed. */
  transcribe(): Promise<string> {
    const Ctor = getCtor();
    if (!Ctor) return Promise.reject(new Error('unavailable'));
    return new Promise((resolve, reject) => {
      const rec = new Ctor();
      this.recognition = rec;
      rec.lang = this.language;
      rec.interimResults = false;
      rec.continuous = false;
      let text = '';
      rec.onresult = (e) => {
        text = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(' ')
          .trim();
      };
      rec.onerror = (e) => reject(new Error(e.error));
      rec.onend = () => {
        this.recognition = null;
        text ? resolve(text) : reject(new Error('empty'));
      };
      rec.start();
    });
  }

  stop(): void {
    this.recognition?.stop();
  }
}
