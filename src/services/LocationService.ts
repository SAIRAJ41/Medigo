export interface GeoPoint {
  lat: number;
  lon: number;
}

/** Wraps the browser location API and remembers the last position found. */
export class LocationService {
  private last: GeoPoint | null = null;

  lastKnown(): GeoPoint | null {
    return this.last;
  }

  /** Resolves with the position, or rejects when denied, unavailable or timed out. */
  getPosition(): Promise<GeoPoint> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) return reject(new Error('unavailable'));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.last = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          resolve(this.last);
        },
        (err) => reject(new Error(err.code === err.PERMISSION_DENIED ? 'denied' : 'failed')),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    });
  }
}
