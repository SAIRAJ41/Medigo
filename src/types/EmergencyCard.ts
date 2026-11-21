/** One knowledge base entry (SPEC section 7: emergency_cards) */
export interface EmergencyCard {
  cardId: number;
  conditionName: string;
  severityGuidance: string;
}
