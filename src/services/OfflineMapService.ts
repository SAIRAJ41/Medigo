/**
 * Map tile source. Tiles come from OpenStreetMap and need internet for now.
 * Offline tile caching (cacheRegion) is a later phase and is not implemented yet.
 */
export class OfflineMapService {
  readonly tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  readonly attribution = '&copy; OpenStreetMap contributors';

  async cacheRegion(): Promise<void> {
    /* later phase: pre-download tiles for the saved facility areas */
  }
}
