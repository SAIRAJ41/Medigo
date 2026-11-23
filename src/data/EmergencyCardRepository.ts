import type { EmergencyCard } from '../types/EmergencyCard';
import { db, type LocalDatabase } from './LocalDatabase';

/** Read access to the local knowledge base. Used by RagService only. */
export interface IEmergencyCardRepository {
  getAll(): Promise<EmergencyCard[]>;
}

/** Knowledge base cards in the Dexie `emergencyCards` table (shared reference data). Works offline. */
export class DexieEmergencyCardRepository implements IEmergencyCardRepository {
  constructor(private readonly database: LocalDatabase = db) {}

  async getAll(): Promise<EmergencyCard[]> {
    await this.database.ready();
    return this.database.emergencyCards.orderBy('cardId').toArray();
  }
}
