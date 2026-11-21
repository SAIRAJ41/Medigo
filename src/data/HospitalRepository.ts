import type { Hospital } from '../types/Hospital';

export interface HospitalWithDistance extends Hospital {
  distanceKm: number;
}

export interface IHospitalRepository {
  getAll(): Promise<Hospital[]>;
  /** Nearest n facilities to a position, closest first. */
  findNearest(lat: number, lon: number, n: number): Promise<HospitalWithDistance[]>;
}
