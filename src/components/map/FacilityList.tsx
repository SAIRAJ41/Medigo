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

const ACTION = 'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold leading-none';

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
              className={`cursor-pointer rounded-xl border p-6 transition-colors duration-150 hover:border-content-muted ${
                nearest ? 'bg-surface-tint' : 'bg-surface'
              } ${selected ? 'border-primary-hover ring-1 ring-primary-hover' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${nearest ? 'bg-primary text-surface' : 'bg-surface-tint text-primary-hover'}`}>
                  <Icon name="local_hospital" className="!text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  {nearest && (
                    <span className="mb-2 inline-flex h-6 items-center rounded-full bg-accent px-3 text-xs font-semibold leading-none text-content">
                      Nearest
                    </span>
                  )}
                  <div className="text-sm font-semibold leading-5 text-content">{f.name}</div>
                  <div className="mt-1 text-xs leading-5 text-content-muted">{f.address}</div>
                </div>
                {hasPosition && (
                  <div className="shrink-0 whitespace-nowrap text-sm font-bold leading-5 text-primary-hover">{formatDistance(f.distanceKm)}</div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 pl-[52px]">
                {f.phone && (
                  <a
                    href={`tel:${f.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`${ACTION} border border-content-muted bg-surface text-content hover:bg-surface-tint active:bg-accent`}
                  >
                    <Icon name="call" className="!text-xl" />
                    Call
                  </a>
                )}
                <a
                  href={`https://www.openstreetmap.org/directions?to=${f.latitude}%2C${f.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`${ACTION} bg-primary text-surface hover:bg-primary-hover active:bg-primary-hover`}
                >
                  <Icon name="directions" className="!text-xl" />
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
