import { Icon } from '../common/Icon';

export function EmergencyNotice() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface p-6 text-sm leading-5 text-content">
      <Icon name="info" className="!text-xl text-primary-hover" />
      <p>
        For a life-threatening emergency,{' '}
        <a href="tel:112" className="rounded font-bold text-primary-hover underline hover:text-content">
          call 112
        </a>{' '}
        for an ambulance. Do not drive yourself if the person is badly hurt.
      </p>
    </div>
  );
}
