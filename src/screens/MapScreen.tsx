import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { EmergencyNotice } from '../components/map/EmergencyNotice';
import { FacilityList } from '../components/map/FacilityList';
import { FacilityMap } from '../components/map/FacilityMap';
import { useServices } from '../context/ServicesContext';
import type { HospitalWithDistance } from '../data/HospitalRepository';
import type { GeoPoint } from '../services/LocationService';
import { distanceKm } from '../utils/geo';

type LocationState = 'locating' | 'found' | 'denied' | 'failed';

export function MapScreen() {
  const { hospitals, location, map: mapService } = useServices();
  const [all, setAll] = useState<HospitalWithDistance[] | null>(null);
  const [position, setPosition] = useState<GeoPoint | null>(location.lastKnown());
  const [state, setState] = useState<LocationState>(position ? 'found' : 'locating');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const locate = useCallback(async () => {
    setState('locating');
    try {
      setPosition(await location.getPosition());
      setState('found');
    } catch (e) {
      setState((e as Error).message === 'denied' ? 'denied' : 'failed');
    }
  }, [location]);

  useEffect(() => {
    void hospitals.getAll().then((list) => setAll(list.map((h) => ({ ...h, distanceKm: 0 }))));
    if (!position) void locate();
  }, [hospitals, location, locate, position]);

  // With a position: sorted by distance. Without: plain list, no distance ordering.
  const facilities = useMemo(() => {
    if (!all) return [];
    if (!position) return all;
    return all
      .map((h) => ({ ...h, distanceKm: distanceKm(position.lat, position.lon, h.latitude, h.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [all, position]);

  const nearestId = position && facilities.length ? facilities[0].hospitalId : null;

  if (!all) return <div className="p-10 text-center text-content-muted">Loading…</div>;

  if (all.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="rounded-xl border border-border bg-surface-tint p-10 text-center text-content">
          <Icon name="local_hospital" className="text-primary" />
          <p className="mt-2 font-semibold">No facility data is stored on this device yet.</p>
          <p className="text-sm text-content-muted">Call 112 in an emergency.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Nearest Facility</h1>
          <p className="text-sm text-content-muted">Medical centres near you</p>
        </div>
        {state === 'locating' && <span className="text-sm text-content-muted">Finding your location…</span>}
        {state === 'found' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-content">
            <Icon name="my_location" className="!text-base" /> Location found
          </span>
        )}
      </div>

      {(state === 'denied' || state === 'failed') && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-accent p-3 text-sm text-content">
          <Icon name="location_off" className="!text-xl" />
          <span className="flex-1">
            {state === 'denied' ? 'Location permission was denied.' : 'Location is not available.'} Showing all facilities without distances.
          </span>
          <Button variant="outline" onClick={locate} className="!py-1.5">Try again</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="h-[420px] lg:col-span-3 lg:h-[600px]">
          <FacilityMap
            facilities={facilities}
            nearestId={nearestId}
            selectedId={selectedId}
            user={position}
            tileUrl={mapService.tileUrl}
            attribution={mapService.attribution}
            onSelect={setSelectedId}
          />
        </div>
        <div className="lg:col-span-2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
          <FacilityList facilities={facilities} hasPosition={!!position} nearestId={nearestId} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      <EmergencyNotice />
    </div>
  );
}
