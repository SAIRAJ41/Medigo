import type { EmergencyCard } from './EmergencyCard';
import type { InputType } from './InputType';

export interface TriageQuery {
  text: string;
  image: string | null; // object URL or data URL of the attached photo
  inputType: InputType;
  context: EmergencyCard[]; // top matches from the local knowledge base
}
