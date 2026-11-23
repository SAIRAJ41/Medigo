/**
 * PRESENTATION ACCOUNTS for demos and the viva. Not real people's data.
 * Created automatically on the first run, and again from Settings > Reset presentation data.
 * Every row they create is flagged `seeded: true`, so a reset never touches real accounts.
 * The steps, condition names and severities come only from the seed emergency cards.
 */
import { hashNewPassword } from '../../services/AuthService';
import type { Case } from '../../types/Case';
import type { ChatMessage, Conversation } from '../../types/Conversation';
import type { StoredUser } from '../UserRepository';
import type { LocalDatabase } from '../LocalDatabase';
import { seedEmergencyCards } from './emergencyCards';

/** Same password for every presentation account. */
export const DEMO_PASSWORD = 'Medigo@123';

// [knowledge base condition, what the user typed, days ago]
type Check = [string, string, number];

interface DemoAccount {
  fullName: string;
  email: string;
  checks: Check[];
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    fullName: 'Sairaj Surlekar',
    email: 'sairaj@demo.medigo',
    checks: [
      ['Burns', 'Spilled hot tea on my hand, the skin is red and stinging', 0],
      ['Insect sting', 'A bee stung my arm in the garden, small swelling', 1],
      ['Fever', 'Fever since last night with body ache', 3],
      ['Severe bleeding', 'Cut my palm on broken glass and it keeps bleeding', 6],
      ['Nosebleed', 'My nose started bleeding while I was reading', 9],
      ['Fracture or sprain', 'Twisted my ankle playing football, it is swollen', 14],
      ['Snakebite', 'My uncle was bitten on the foot by a snake in the field', 21],
      ['Eye injury', 'Dust went into my eye while riding the scooter', 27],
    ],
  },
  {
    fullName: 'Priya Naik',
    email: 'priya@demo.medigo',
    checks: [
      ['Fever', 'My daughter has a fever and feels very hot', 0],
      ['Nosebleed', 'My son has a nosebleed after sneezing', 2],
      ['Insect sting', 'A wasp stung me on the neck, mild redness', 5],
      ['Fainting', 'My mother felt dizzy and fainted for a few seconds', 8],
      ['Burns', 'Touched a hot pan, small blister on my finger', 16],
      ['Insect sting', 'Bee sting on my hand while picking flowers', 25],
    ],
  },
  {
    fullName: 'Rohan Gaonkar',
    email: 'rohan@demo.medigo',
    checks: [
      ['Electric shock', 'Got a shock from a loose wire at the workshop', 1],
      ['Fracture or sprain', 'Fell from a ladder and my wrist hurts a lot', 4],
      ['Heat stroke', 'A co-worker collapsed after working in the sun all day', 7],
      ['Severe bleeding', 'Deep cut on my leg from a sickle, a lot of blood', 11],
      ['Animal bite', 'A stray dog bit my leg and the skin is broken', 15],
      ['Burns', 'Hot oil splashed on my forearm while cooking', 20],
      ['Drowning', 'Pulled a boy out of the river, he swallowed water', 28],
    ],
  },
  // Empty history: shows the empty states on the Dashboard and in the chat history panel.
  { fullName: 'Anita Fernandes', email: 'anita@demo.medigo', checks: [] },
  {
    fullName: 'Mahesh Desai',
    email: 'mahesh@demo.medigo',
    checks: [
      ['Heat stroke', 'My father feels very weak and hot after working in the sun', 0],
      ['Fever', 'High fever and chills since yesterday', 3],
      ['Snakebite', 'Bitten by a snake near the paddy field', 10],
      ['Eye injury', 'Chemical splashed in my eye while cleaning', 18],
      ['Insect sting', 'Stung by a bee near the hive, a little swelling', 26],
    ],
  },
  {
    fullName: 'Sunita Kamat',
    email: 'sunita@demo.medigo',
    checks: [
      ['Nosebleed', 'My son has a nosebleed after playing outside', 2],
      ['Fainting', 'I fainted in the kitchen and still feel dizzy', 6],
      ['Poisoning', 'My child drank some kerosene from a bottle', 13],
      ['Burns', 'Steam burn on my wrist from the pressure cooker', 22],
    ],
  },
  // Empty history as well.
  { fullName: "Joao D'Souza", email: 'joao@demo.medigo', checks: [] },
];

const HOUR = 3600 * 1000;

/** Settings > Reset presentation data. Only seeded rows are touched. */
export async function resetPresentationData(): Promise<void> {
  const { db } = await import('../LocalDatabase');
  await db.ready();
  await seedDemoAccounts(db);
}
const iso = (ms: number) => new Date(ms).toISOString();

/**
 * Deletes every seeded account (and its conversations, messages and cases) and creates the seven again.
 * A seeded account keeps its old userId, so a signed-in presentation session stays valid.
 * An email already used by a real (non-seeded) account is skipped, never overwritten.
 */
export async function seedDemoAccounts(d: LocalDatabase): Promise<void> {
  // Hash first: awaiting Web Crypto inside a Dexie transaction would end the transaction.
  const passwords = await Promise.all(DEMO_ACCOUNTS.map(() => hashNewPassword(DEMO_PASSWORD)));
  const now = Date.now();

  await d.transaction('rw', [d.users, d.conversations, d.messages, d.cases], async () => {
    const old = await d.users.filter((u) => !!u.seeded).toArray();
    const oldIds = old.map((u) => u.userId);
    const convIds = (await d.conversations.where('userId').anyOf(oldIds).primaryKeys()) as number[];
    await d.messages.where('conversationId').anyOf(convIds).delete();
    await d.conversations.bulkDelete(convIds);
    await d.cases.where('userId').anyOf(oldIds).delete();
    await d.users.bulkDelete(oldIds);

    for (const [i, account] of DEMO_ACCOUNTS.entries()) {
      if (await d.users.where('email').equals(account.email).first()) continue; // a real account owns this email
      const previous = old.find((u) => u.email === account.email);
      const user = {
        ...(previous ? { userId: previous.userId } : {}),
        fullName: account.fullName,
        email: account.email,
        createdAt: iso(now - 40 * 24 * HOUR),
        seeded: true,
        ...passwords[i],
      } as StoredUser;
      const userId = await d.users.add(user);

      for (const [j, [cardName, text, daysAgo]] of account.checks.entries()) {
        const card = seedEmergencyCards.find((c) => c.conditionName === cardName);
        if (!card) continue;
        // Spread across the day so two checks on one day do not share a time.
        const asked = now - daysAgo * 24 * HOUR - (2 + (j % 5) * 2) * HOUR;
        const answered = asked + 20 * 1000;
        const result = {
          condition: card.conditionName,
          severityColor: card.severityColor,
          severityLevel: card.severityLevel,
          steps: card.severityGuidance.split('\n'),
          seekFacility: card.seekFacility,
        };
        const conversationId = await d.conversations.add({
          userId,
          title: card.conditionName,
          titleSource: 'result',
          createdAt: iso(asked),
          updatedAt: iso(answered),
          lastSeverityColor: card.severityColor,
          lastSeverityLevel: card.severityLevel,
          seeded: true,
        } as Conversation);
        await d.messages.add({
          conversationId,
          role: 'user',
          text,
          inputType: 'TEXT',
          result: null,
          outcome: null,
          timestamp: iso(asked),
          seeded: true,
        } as ChatMessage);
        const caseId = await d.cases.add({
          userId,
          conversationId,
          inputText: text,
          inputImagePath: null,
          condition: card.conditionName,
          severityColor: card.severityColor,
          severityLevel: card.severityLevel,
          guidance: card.severityGuidance,
          timestamp: iso(answered),
          seeded: true,
        } as Case);
        await d.messages.add({
          conversationId,
          role: 'assistant',
          text: '',
          inputType: 'TEXT',
          result,
          outcome: 'RESULT',
          timestamp: iso(answered),
          caseId,
          seeded: true,
        } as ChatMessage);
      }
    }
  });
}
