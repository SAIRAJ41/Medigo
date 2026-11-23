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

  if (!all) return <MapSkeleton />;

  if (all.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-content">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tint">
            <Icon name="local_hospital" className="text-primary-hover" />
          </div>
          <p className="font-semibold">No facility data is stored on this device yet.</p>
          <p className="mt-1 text-sm text-content-muted">Call 112 in an emergency.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-10 text-content">Nearest Facility</h1>
          <p className="mt-1 text-sm leading-5 text-content-muted">Medical centres near you</p>
        </div>
        {state === 'locating' && (
          <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold leading-none text-content" role="status">
            <Icon name="location_searching" className="!text-base pulse-dot" />
            Finding your location…
          </span>
        )}
        {state === 'found' && (
          <span className="inline-flex h-8 items-center gap-2 rounded-lg bg-soft-blue px-3 text-xs font-semibold leading-none text-content">
            <Icon name="my_location" className="!text-base" />
            Location found
          </span>
        )}
      </div>

      {(state === 'denied' || state === 'failed') && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-soft-cream p-4 text-sm leading-5 text-content">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <Icon name="location_off" className="!text-xl" />
            <span>
              {state === 'denied' ? 'Location permission was denied.' : 'Location is not available.'} Showing all facilities without distances.
            </span>
          </span>
          <Button variant="outline" icon="refresh" onClick={locate}>Try again</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map and list panels share one fixed height on desktop. */}
        <div className="h-[420px] min-w-0 lg:col-span-3 lg:h-[600px]">
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
        <div className="min-w-0 lg:col-span-2 lg:h-[600px] lg:overflow-y-auto lg:pr-2">
          <FacilityList facilities={facilities} hasPosition={!!position} nearestId={nearestId} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      <EmergencyNotice />
    </div>
  );
}

/** Placeholder blocks that match the map layout while facilities load. */
function MapSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8" aria-busy="true" aria-label="Loading facilities">
      <div className="space-y-2">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-5 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="skeleton h-[420px] !rounded-xl lg:col-span-3 lg:h-[600px]" />
        <div className="space-y-3 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-[136px] !rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
