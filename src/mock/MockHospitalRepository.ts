import type { HospitalWithDistance, IHospitalRepository } from '../data/HospitalRepository';
import type { Hospital } from '../types/Hospital';
import { distanceKm } from '../utils/geo';
import { mockHospitals } from './mockHospitals';

export class MockHospitalRepository implements IHospitalRepository {
  async getAll(): Promise<Hospital[]> {
    return [...mockHospitals];
  }

  async findNearest(lat: number, lon: number, n: number): Promise<HospitalWithDistance[]> {
    return mockHospitals
      .map((h) => ({ ...h, distanceKm: distanceKm(lat, lon, h.latitude, h.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, n);
  }
}
