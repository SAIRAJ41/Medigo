/** A local, on-device account. A server account replaces this later. */
export interface User {
  userId: number;
  fullName: string;
  email: string; // always stored lowercase
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string; // ISO date string
}
