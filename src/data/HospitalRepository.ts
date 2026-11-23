import type { Hospital } from '../types/Hospital';
import { distanceKm } from '../utils/geo';
import { db, type LocalDatabase } from './LocalDatabase';

export interface HospitalWithDistance extends Hospital {
  distanceKm: number;
}

export interface IHospitalRepository {
  getAll(): Promise<Hospital[]>;
  /** Nearest n facilities to a position, closest first. */
  findNearest(lat: number, lon: number, n: number): Promise<HospitalWithDistance[]>;
}

/** Facilities in the Dexie `hospitals` table (shared reference data, not per user). Works offline. */
export class DexieHospitalRepository implements IHospitalRepository {
  constructor(private readonly database: LocalDatabase = db) {}

  async getAll(): Promise<Hospital[]> {
    await this.database.ready();
    return this.database.hospitals.toArray();
  }

  async findNearest(lat: number, lon: number, n: number): Promise<HospitalWithDistance[]> {
    return (await this.getAll())
      .map((h) => ({ ...h, distanceKm: distanceKm(lat, lon, h.latitude, h.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, n);
  }
}
