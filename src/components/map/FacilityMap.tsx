import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { GeoPoint } from '../../services/LocationService';
import type { HospitalWithDistance } from '../../data/HospitalRepository';

interface Props {
  facilities: HospitalWithDistance[];
  nearestId: number | null;
  selectedId: number | null;
  user: GeoPoint | null;
  tileUrl: string;
  attribution: string;
  onSelect: (id: number) => void;
}

const divIcon = (cls: string, size: number) => L.divIcon({ className: '', html: `<div class="${cls}"></div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

/** Leaflet map. Pins are styled with CSS variables, so no colors live here. */
export function FacilityMap({ facilities, nearestId, selectedId, user, tileUrl, attribution, onSelect }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: true }).setView([15.35, 73.95], 9);
    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [tileUrl, attribution]);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const points: L.LatLngExpression[] = [];
    facilities.forEach((f) => {
      const isNearest = f.hospitalId === nearestId;
      const marker = L.marker([f.latitude, f.longitude], { icon: divIcon(isNearest ? 'pin pin-nearest' : 'pin', isNearest ? 20 : 14), title: f.name });
      marker.bindPopup(`<strong>${f.name.replace(/</g, '&lt;')}</strong><br/>${f.address.replace(/</g, '&lt;')}`);
      marker.on('click', () => onSelect(f.hospitalId));
      marker.addTo(g);
      points.push([f.latitude, f.longitude]);
    });
    if (user) {
      L.marker([user.lat, user.lon], { icon: divIcon('pin-user', 16), title: 'You are here', zIndexOffset: 1000 }).addTo(g);
      points.push([user.lat, user.lon]);
    }
    if (points.length) m.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
  }, [facilities, nearestId, user, onSelect]);

  // Pan to the selected facility and open its popup.
  useEffect(() => {
    const m = map.current;
    const f = facilities.find((x) => x.hospitalId === selectedId);
    if (!m || !f) return;
    const target: L.LatLngExpression = [f.latitude, f.longitude];
    const zoom = Math.max(m.getZoom(), 12);
    // Jump instead of flying when the user prefers reduced motion.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) m.setView(target, zoom, { animate: false });
    else m.flyTo(target, zoom, { duration: 0.6 });
  }, [selectedId, facilities]);

  return <div ref={el} className="h-full min-h-[320px] w-full overflow-hidden rounded-xl border border-border" role="region" aria-label="Facility map" />;
}
