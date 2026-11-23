import type { IEmergencyCardRepository } from '../data/EmergencyCardRepository';
import type { EmergencyCard } from '../types/EmergencyCard';

// Words that carry no meaning for matching.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'am', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'he', 'her', 'his', 'i', 'in', 'is', 'it',
  'its', 'me', 'my', 'of', 'on', 'or', 'she', 'so', 'the', 'then', 'they', 'to', 'was', 'we', 'while', 'with', 'now', 'not', 'very',
]);

/** Light stemmer: "fangs" -> "fang", "bleeding" -> "bleed". Only needs to be consistent for cards and queries. */
const stem = (w: string): string => {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};

const tokenize = (text: string): string[] =>
  Array.from(new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => !STOPWORDS.has(w)).map(stem)));

const NAME_WEIGHT = 3; // a word in the condition name is the strongest signal
const KEYWORD_WEIGHT = 2;
/** Below this the match is too weak (e.g. only a common word) and nothing is returned. */
const MIN_SCORE = 1.5;

interface IndexedCard {
  card: EmergencyCard;
  terms: Map<string, number>; // stemmed term -> weight
}

/**
 * Searches the local knowledge base (condition name + keywords). Works offline.
 * Score = sum over matched words of (field weight x rarity). A word that appears in many cards
 * (like "hot") counts less than a word that appears in one card (like "snake").
 */
export class RagService {
  private index: IndexedCard[] = [];
  private idf = new Map<string, number>();
  private loaded = false;

  constructor(
    private readonly repo: IEmergencyCardRepository,
    private readonly topK = 3,
  ) {}

  async loadKnowledgeBase(): Promise<void> {
    const cards = await this.repo.getAll();
    this.index = cards.map((card) => {
      const terms = new Map<string, number>();
      for (const t of tokenize((card.keywords ?? []).join(' '))) terms.set(t, KEYWORD_WEIGHT);
      for (const t of tokenize(card.conditionName)) terms.set(t, NAME_WEIGHT); // name wins over keyword
      return { card, terms };
    });

    const docFreq = new Map<string, number>();
    for (const { terms } of this.index) for (const t of terms.keys()) docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
    const n = Math.max(this.index.length, 1);
    this.idf = new Map(Array.from(docFreq, ([t, df]) => [t, Math.log(1 + n / df)]));
    this.loaded = true;
  }

  /** Top matches for the text, best first. Empty when nothing matches well enough. */
  async search(text: string): Promise<EmergencyCard[]> {
    if (!this.loaded) await this.loadKnowledgeBase();
    const words = tokenize(text);
    if (words.length === 0) return [];
    return this.index
      .map(({ card, terms }) => {
        let score = 0;
        for (const w of words) {
          const weight = terms.get(w);
          if (weight) score += weight * (this.idf.get(w) ?? 1);
        }
        return { card, score };
      })
      .filter((x) => x.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK)
      .map((x) => x.card);
  }
}
