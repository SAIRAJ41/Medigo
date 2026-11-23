import type { Hospital } from '../../types/Hospital';

/**
 * SAMPLE DATA, not a verified directory: six Goa facilities used to seed the Dexie `hospitals` table on first run.
 * Coordinates and addresses are approximate. Replace with the verified dataset later.
 */
export const seedHospitals: Hospital[] = [
  { hospitalId: 1, name: 'Goa Medical College and Hospital', latitude: 15.4627, longitude: 73.8552, address: 'Bambolim, Goa' },
  { hospitalId: 2, name: 'Asilo Hospital', latitude: 15.5909, longitude: 73.8082, address: 'Mapusa, North Goa' },
  { hospitalId: 3, name: 'District Hospital (Hospicio)', latitude: 15.28, longitude: 73.957, address: 'Margao, South Goa' },
  { hospitalId: 4, name: 'Sub-District Hospital Ponda', latitude: 15.403, longitude: 74.0153, address: 'Ponda, Goa' },
  { hospitalId: 5, name: 'Community Health Centre Pernem', latitude: 15.72, longitude: 73.796, address: 'Pernem, North Goa' },
  { hospitalId: 6, name: 'Community Health Centre Canacona', latitude: 15.01, longitude: 74.02, address: 'Canacona, South Goa' },
];
