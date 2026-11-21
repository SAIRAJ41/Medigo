import type { IEmergencyCardRepository } from '../data/EmergencyCardRepository';
import type { EmergencyCard } from '../types/EmergencyCard';
import { mockEmergencyCards } from './mockEmergencyCards';

export class MockEmergencyCardRepository implements IEmergencyCardRepository {
  async getAll(): Promise<EmergencyCard[]> {
    return [...mockEmergencyCards];
  }
}
