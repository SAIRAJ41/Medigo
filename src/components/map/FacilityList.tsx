import type { HospitalWithDistance } from '../../data/HospitalRepository';
import { formatDistance } from '../../utils/format';
import { Icon } from '../common/Icon';

interface Props {
  facilities: HospitalWithDistance[];
  hasPosition: boolean;
  nearestId: number | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** Facility cards. Distances and the Nearest chip appear only when the position is known. */
export function FacilityList({ facilities, hasPosition, nearestId, selectedId, onSelect }: Props) {
  return (
    <ul className="space-y-3">
      {facilities.map((f) => {
        const nearest = hasPosition && f.hospitalId === nearestId;
        const selected = f.hospitalId === selectedId;
        return (
          <li key={f.hospitalId}>
            <div
              onClick={() => onSelect(f.hospitalId)}
              className={`cursor-pointer rounded-xl border p-4 ${nearest ? 'bg-surface-tint' : 'bg-surface'} ${selected ? 'border-primary' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Icon name="local_hospital" className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  {nearest && <span className="mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-content">Nearest</span>}
                  <div className="text-sm font-semibold text-content">{f.name}</div>
                  <div className="text-xs text-content-muted">{f.address}</div>
                </div>
                {hasPosition && <div className="shrink-0 text-sm font-bold text-primary">{formatDistance(f.distanceKm)}</div>}
              </div>
              <div className="mt-3 flex gap-2">
                {f.phone && (
                  <a href={`tel:${f.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-content hover:bg-surface-tint">
                    <Icon name="call" className="!text-base" />
                    Call
                  </a>
                )}
                <a
                  href={`https://www.openstreetmap.org/directions?to=${f.latitude}%2C${f.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  <Icon name="directions" className="!text-base" />
                  Directions
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
