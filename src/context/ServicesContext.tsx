import { createContext, useContext, type ReactNode } from 'react';
import { IS_DEMO_MODE } from '../config/env';
import type { ICaseRepository } from '../data/CaseRepository';
import type { IHospitalRepository } from '../data/HospitalRepository';
import { MockApiClient } from '../mock/MockApiClient';
import { MockCaseRepository } from '../mock/MockCaseRepository';
import { MockEmergencyCardRepository } from '../mock/MockEmergencyCardRepository';
import { MockHospitalRepository } from '../mock/MockHospitalRepository';
import { LocationService } from '../services/LocationService';
import { OfflineMapService } from '../services/OfflineMapService';
import { RagService } from '../services/RagService';
import { TriageService } from '../services/TriageService';
import { VoiceService } from '../services/VoiceService';

export interface Services {
  cases: ICaseRepository;
  hospitals: IHospitalRepository;
  triage: TriageService;
  voice: VoiceService;
  location: LocationService;
  map: OfflineMapService;
}

/** The only place that decides mock vs real. Screens just call useServices(). */
function createServices(): Services {
  if (!IS_DEMO_MODE) {
    throw new Error('Real data layer (Dexie + proxy) is not wired yet. Set IS_DEMO_MODE = true in src/config/env.ts.');
  }
  const cases = new MockCaseRepository();
  const hospitals = new MockHospitalRepository();
  const rag = new RagService(new MockEmergencyCardRepository());
  const triage = new TriageService(rag, new MockApiClient(), cases);
  return { cases, hospitals, triage, voice: new VoiceService(), location: new LocationService(), map: new OfflineMapService() };
}

const services = createServices();
const Ctx = createContext<Services>(services);

export function ServicesProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={services}>{children}</Ctx.Provider>;
}

export const useServices = () => useContext(Ctx);
