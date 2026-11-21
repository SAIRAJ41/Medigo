import type { IEmergencyCardRepository } from '../data/EmergencyCardRepository';
import type { EmergencyCard } from '../types/EmergencyCard';

/** Extra words people use for each condition. Keeps matching simple and fully offline. */
const KEYWORDS: Record<string, string[]> = {
  Burns: ['burn', 'burned', 'burnt', 'scald', 'scalded', 'hot', 'water', 'fire', 'blister', 'oil', 'steam'],
  'Severe bleeding': ['bleeding', 'bleed', 'blood', 'cut', 'wound', 'gash', 'stab', 'puncture', 'nail'],
  Choking: ['choking', 'choke', 'choked', 'swallowed', 'throat', 'stuck', 'cough'],
  'Fracture or sprain': ['fracture', 'broken', 'bone', 'sprain', 'sprained', 'ankle', 'twisted', 'swelling', 'fall', 'fell', 'wrist'],
  Snakebite: ['snake', 'snakebite', 'bitten', 'fang', 'venom'],
  Fever: ['fever', 'temperature', 'chills', 'shivering'],
  'Heat stroke': ['heat', 'sun', 'sunstroke', 'dehydrated', 'hot', 'weak'],
  Poisoning: ['poison', 'poisoned', 'swallowed', 'drank', 'pesticide', 'chemical', 'kerosene', 'overdose'],
  'Animal bite': ['dog', 'bite', 'bitten', 'animal', 'monkey', 'cat', 'rabies', 'scratch', 'stray'],
  Fainting: ['faint', 'fainted', 'unconscious', 'dizzy', 'collapsed', 'passed'],
  Nosebleed: ['nose', 'nosebleed'],
  'Eye injury': ['eye', 'eyes', 'dust', 'splash', 'vision'],
  'Electric shock': ['electric', 'shock', 'electrocuted', 'current', 'wire', 'socket'],
  Drowning: ['drown', 'drowning', 'drowned', 'pool', 'river', 'well', 'pond'],
  'Insect sting': ['sting', 'stung', 'bee', 'wasp', 'insect', 'hornet', 'scorpion'],
};

const tokenize = (text: string) => Array.from(new Set(text.toLowerCase().match(/[a-z]+/g) ?? []));

/** Searches the local knowledge base. Works offline. */
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
        const vocab = new Set([...tokenize(card.conditionName), ...(KEYWORDS[card.conditionName] ?? [])]);
        const score = words.filter((w) => vocab.has(w)).length;
        return { card, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK)
      .map((x) => x.card);
  }
}
