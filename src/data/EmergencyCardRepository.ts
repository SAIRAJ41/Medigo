import type { EmergencyCard } from '../types/EmergencyCard';

/** Read access to the local knowledge base. Used by RagService only. */
export interface IEmergencyCardRepository {
  getAll(): Promise<EmergencyCard[]>;
}
