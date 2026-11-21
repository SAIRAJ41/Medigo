/** SPEC section 7: hospitals */
export interface Hospital {
  hospitalId: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string; // optional, used for the call button
}
