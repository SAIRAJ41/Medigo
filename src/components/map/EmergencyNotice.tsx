import { Icon } from '../common/Icon';

export function EmergencyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-tint p-4 text-sm text-content">
      <Icon name="info" className="text-primary" />
      <p>
        For a life-threatening emergency, <a href="tel:112" className="font-bold text-primary underline">call 112</a> for an ambulance. Do not drive yourself if the person is badly hurt.
      </p>
    </div>
  );
}
