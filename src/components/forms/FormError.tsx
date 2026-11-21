import { Icon } from '../common/Icon';

/**
 * One-line message for a failure that belongs to no single field (for example "sign-in paused").
 * Red text with an error icon, like the inline field errors.
 */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 text-sm font-medium leading-5 text-severity-red">
      <Icon name="error" className="!text-xl" />
      <span>{message}</span>
    </p>
  );
}
