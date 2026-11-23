import type { LocalDatabase } from '../LocalDatabase';
import type { StoredUser } from '../UserRepository';
import { seedDemoAccounts } from './demoAccounts';
import { seedEmergencyCards } from './emergencyCards';
import { seedHospitals } from './hospitals';

const DEMO_SEEDED = 'demoAccountsSeeded';
/** Bump when seedEmergencyCards changes, so devices that already have cards get the new set. */
export const KB_VERSION = '2';
const KB_VERSION_KEY = 'knowledgeBaseVersion';
/** Where accounts lived before Dexie. Read once by the migration below, then removed. */
const LEGACY_USERS_KEY = 'medigo.users';

/** Copies accounts from the old localStorage store into `users` once, keeping their ids (the session points at them). */
async function migrateLegacyUsers(d: LocalDatabase) {
  let legacy: StoredUser[] = [];
  try {
    const raw = localStorage.getItem(LEGACY_USERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    legacy = Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return; // storage blocked or unreadable: nothing to migrate
  }
  if (legacy.length === 0) return;
  await d.transaction('rw', d.users, async () => {
    for (const u of legacy) {
      if (!u?.email || !u.passwordHash) continue;
      const email = u.email.trim().toLowerCase();
      if (await d.users.where('email').equals(email).first()) continue;
      await d.users.put({ ...u, email });
    }
  });
  try {
    localStorage.removeItem(LEGACY_USERS_KEY);
  } catch {
    /* already copied; a leftover copy is skipped next time by the email check */
  }
}

/**
 * Replaces the knowledge base cards when KB_VERSION changes (or on first run).
 * Only emergencyCards and its meta row are touched: users, conversations, messages and cases are left as they are
 * (cases store their own copy of the condition and steps, not a cardId).
 */
async function syncKnowledgeBase(d: LocalDatabase) {
  if ((await d.getMeta(KB_VERSION_KEY)) === KB_VERSION) return;
  await d.transaction('rw', d.emergencyCards, d.meta, async () => {
    await d.emergencyCards.clear();
    await d.emergencyCards.bulkAdd(seedEmergencyCards);
    await d.meta.put({ key: KB_VERSION_KEY, value: KB_VERSION });
  });
}

/** Runs on every start; each step only does work the first time (or when the knowledge base version changes). */
export async function runFirstRunJobs(d: LocalDatabase): Promise<void> {
  // Reference data (shared by all accounts).
  await syncKnowledgeBase(d);
  if ((await d.hospitals.count()) === 0) await d.hospitals.bulkAdd(seedHospitals);

  await migrateLegacyUsers(d);

  // Presentation accounts: created once per device. After that only Settings > Reset presentation data recreates them.
  if (!(await d.getMeta(DEMO_SEEDED))) {
    await seedDemoAccounts(d);
    await d.setMeta(DEMO_SEEDED, new Date().toISOString());
  }
}
