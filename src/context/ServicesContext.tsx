import { createContext, useContext, type ReactNode } from 'react';
import { USE_REAL_TRIAGE } from '../config/env';
import { DexieCaseRepository, type ICaseRepository } from '../data/CaseRepository';
import { DexieConversationRepository, type IConversationRepository } from '../data/ConversationRepository';
import { DexieEmergencyCardRepository } from '../data/EmergencyCardRepository';
import { DexieHospitalRepository, type IHospitalRepository } from '../data/HospitalRepository';
import { resetPresentationData } from '../data/seed/demoAccounts';
import { MockApiClient } from '../mock/MockApiClient';
import { ApiClient, type IApiClient } from '../services/ApiClient';
import { LocationService } from '../services/LocationService';
import { OfflineMapService } from '../services/OfflineMapService';
import { RagService } from '../services/RagService';
import { TriageService } from '../services/TriageService';
import { VoiceService } from '../services/VoiceService';

export interface Services {
  cases: ICaseRepository;
  conversations: IConversationRepository;
  hospitals: IHospitalRepository;
  triage: TriageService;
  voice: VoiceService;
  location: LocationService;
  map: OfflineMapService;
  /** Deletes and recreates only the seeded presentation accounts. */
  resetPresentationData: () => Promise<void>;
}

/** The only place that picks implementations. Screens just call useServices(). */
function createServices(): Services {
  // Real on-device storage (Dexie / IndexedDB). Every user-data query is filtered by the signed-in user's id.
  const cases = new DexieCaseRepository();
  const hospitals = new DexieHospitalRepository();
  const rag = new RagService(new DexieEmergencyCardRepository());
  // Real AI replies through the proxy when VITE_USE_REAL_TRIAGE=true; otherwise the demo MockApiClient.
  const api: IApiClient = USE_REAL_TRIAGE ? new ApiClient() : new MockApiClient();
  const triage = new TriageService(rag, api, cases);
  return {
    cases,
    conversations: new DexieConversationRepository(),
    hospitals,
    triage,
    voice: new VoiceService(),
    location: new LocationService(),
    map: new OfflineMapService(),
    resetPresentationData,
  };
}

const services = createServices();
const Ctx = createContext<Services>(services);

export function ServicesProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={services}>{children}</Ctx.Provider>;
}

export const useServices = () => useContext(Ctx);
