import type { Case } from '../types/Case';
import type { SeverityColor } from '../types/SeverityColor';
import type { SeverityLevel } from '../types/SeverityLevel';
import { mockEmergencyCards } from './mockEmergencyCards';

/** DEMO severity per knowledge base condition (used by the mock API and the sample history). */
export const mockSeverityByCondition: Record<string, { color: SeverityColor; level: SeverityLevel; seekFacility: boolean }> = {
  Burns: { color: 'YELLOW', level: 'MEDIUM', seekFacility: false },
  'Severe bleeding': { color: 'RED', level: 'HIGH', seekFacility: true },
  Choking: { color: 'RED', level: 'HIGH', seekFacility: true },
  'Fracture or sprain': { color: 'YELLOW', level: 'MEDIUM', seekFacility: true },
  Snakebite: { color: 'RED', level: 'HIGH', seekFacility: true },
  Fever: { color: 'YELLOW', level: 'LOW', seekFacility: false },
  'Heat stroke': { color: 'RED', level: 'HIGH', seekFacility: true },
  Poisoning: { color: 'RED', level: 'HIGH', seekFacility: true },
  'Animal bite': { color: 'YELLOW', level: 'HIGH', seekFacility: true },
  Fainting: { color: 'YELLOW', level: 'MEDIUM', seekFacility: false },
  Nosebleed: { color: 'GREEN', level: 'LOW', seekFacility: false },
  'Eye injury': { color: 'YELLOW', level: 'MEDIUM', seekFacility: true },
  'Electric shock': { color: 'RED', level: 'HIGH', seekFacility: true },
  Drowning: { color: 'RED', level: 'HIGH', seekFacility: true },
  'Insect sting': { color: 'GREEN', level: 'LOW', seekFacility: false },
};

// [title, what the user typed, knowledge base condition, color, level, hours ago]
type Row = [string, string, string, SeverityColor, SeverityLevel, number];

const rows: Row[] = [
  ['Burn on hand', 'My hand got burned with hot water, the skin is red and painful', 'Burns', 'YELLOW', 'MEDIUM', 3],
  ['Minor finger cut', 'Cut my finger while chopping vegetables, small cut', 'Severe bleeding', 'GREEN', 'LOW', 28],
  ['Deep puncture wound', 'Stepped on a rusty nail, the wound is deep and bleeding', 'Severe bleeding', 'RED', 'HIGH', 240],
  ['Sprained left ankle', 'Twisted my left ankle on the stairs, swollen and painful', 'Fracture or sprain', 'YELLOW', 'MEDIUM', 270],
  ['Bee sting on forearm', 'A bee stung my forearm, a little swelling', 'Insect sting', 'GREEN', 'LOW', 330],
  ['Nosebleed', 'My nose started bleeding suddenly', 'Nosebleed', 'GREEN', 'LOW', 400],
  ['Mild fever', 'Fever since last night with body ache', 'Fever', 'YELLOW', 'LOW', 460],
  ['Small scald on arm', 'Spilled hot tea on my arm, red patch', 'Burns', 'GREEN', 'LOW', 520],
  ['Dog bite on leg', 'A stray dog bit my leg, broken skin', 'Animal bite', 'YELLOW', 'HIGH', 600],
  ['Dizzy and fainted', 'Felt dizzy in the heat and fainted for a few seconds', 'Fainting', 'YELLOW', 'MEDIUM', 690],
  ['Insect sting on neck', 'Wasp sting on the neck, mild redness', 'Insect sting', 'GREEN', 'LOW', 760],
  ['Snakebite on foot', 'Bitten on the foot by a snake in the field', 'Snakebite', 'RED', 'HIGH', 840],
  ['Eye irritation', 'Dust went into my eye, it is watering', 'Eye injury', 'GREEN', 'LOW', 920],
  ['Minor cut on knee', 'Scraped my knee after a fall, small cut', 'Severe bleeding', 'GREEN', 'LOW', 1000],
  ['Fever with chills', 'High fever and chills for two days', 'Fever', 'YELLOW', 'MEDIUM', 1100],
  ['Heat exhaustion', 'Felt weak and dizzy after working in the sun', 'Heat stroke', 'RED', 'HIGH', 1200],
  ['Small burn on finger', 'Touched a hot pan, small red mark', 'Burns', 'GREEN', 'LOW', 1300],
  ['Nosebleed in child', 'My child has a nosebleed after sneezing', 'Nosebleed', 'GREEN', 'LOW', 1400],
  ['Bee sting on hand', 'Stung on the hand by a bee', 'Insect sting', 'GREEN', 'LOW', 1500],
  ['Wrist pain after fall', 'Fell on my wrist, pain when moving it', 'Fracture or sprain', 'YELLOW', 'MEDIUM', 1600],
  ['Mild fever', 'Slight fever and tiredness', 'Fever', 'GREEN', 'LOW', 1700],
  ['Scratch from cat', 'A cat scratched my arm, light scratch', 'Animal bite', 'GREEN', 'LOW', 1800],
  ['Dust in eye', 'Something got into my eye while riding', 'Eye injury', 'GREEN', 'LOW', 1900],
  ['Small cut on thumb', 'Paper cut on thumb that stopped bleeding', 'Severe bleeding', 'GREEN', 'LOW', 2000],
];

/** Builds the sample history (24 cases) relative to the current time. */
export function buildMockCases(): Case[] {
  const now = Date.now();
  return rows.map(([condition, text, cardName, color, level, hoursAgo], i) => {
    const card = mockEmergencyCards.find((c) => c.conditionName === cardName);
    return {
      caseId: i + 1,
      condition,
      inputText: text,
      inputImagePath: null,
      severityColor: color,
      severityLevel: level,
      guidance: card ? card.severityGuidance : '',
      timestamp: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
    };
  });
}
