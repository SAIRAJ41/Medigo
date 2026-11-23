import type { IEmergencyCardRepository } from '../data/EmergencyCardRepository';
import type { EmergencyCard } from '../types/EmergencyCard';

const tokenize = (text: string) => Array.from(new Set(text.toLowerCase().match(/[a-z]+/g) ?? []));

/** Searches the local knowledge base (Dexie emergencyCards: condition name + keywords). Works offline. */
export class RagService {
  private cards: EmergencyCard[] = [];
  private loaded = false;

  constructor(
    private readonly repo: IEmergencyCardRepository,
    private readonly topK = 3,
  ) {}

  async loadKnowledgeBase(): Promise<void> {
    this.cards = await this.repo.getAll();
    this.loaded = true;
  }

  /** Top matches for the text, best first. Empty when nothing matches. */
  async search(text: string): Promise<EmergencyCard[]> {
    if (!this.loaded) await this.loadKnowledgeBase();
    const words = tokenize(text);
    if (words.length === 0) return [];
    return this.cards
      .map((card) => {
        const vocab = new Set([...tokenize(card.conditionName), ...(card.keywords ?? [])]);
        const score = words.filter((w) => vocab.has(w)).length;
        return { card, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK)
      .map((x) => x.card);
  }
}
