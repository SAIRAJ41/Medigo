/**
 * LocalDatabase: the single door to on-device storage (IndexedDB through Dexie).
 * Not wired yet. The demo uses in-memory mock repositories instead.
 * When IS_DEMO_MODE is turned off, implement open/close here with Dexie stores:
 * cases, hospitals, emergency_cards (SPEC section 7).
 */
export class LocalDatabase {
  constructor(private readonly dbName = 'medigo') {}

  get name(): string {
    return this.dbName;
  }

  async open(): Promise<void> {
    throw new Error('LocalDatabase is not wired yet. Keep IS_DEMO_MODE = true until the Dexie layer is added.');
  }

  async close(): Promise<void> {
    /* nothing to close yet */
  }
}
