import type { LocalDatabase } from '../LocalDatabase';
import type { StoredUser } from '../UserRepository';
import { seedDemoAccounts } from './demoAccounts';
import { seedEmergencyCards } from './emergencyCards';
import { seedHospitals } from './hospitals';

const DEMO_SEEDED = 'demoAccountsSeeded';
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

/** Runs on every start; each step only does work the first time. */
export async function runFirstRunJobs(d: LocalDatabase): Promise<void> {
  // Reference data (shared by all accounts).
  if ((await d.emergencyCards.count()) === 0) await d.emergencyCards.bulkAdd(seedEmergencyCards);
  if ((await d.hospitals.count()) === 0) await d.hospitals.bulkAdd(seedHospitals);

  await migrateLegacyUsers(d);

  // Presentation accounts: created once per device. After that only Settings > Reset presentation data recreates them.
  if (!(await d.getMeta(DEMO_SEEDED))) {
    await seedDemoAccounts(d);
    await d.setMeta(DEMO_SEEDED, new Date().toISOString());
  }
}
