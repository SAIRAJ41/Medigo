import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline';

// Disabled states swap to readable token pairs instead of fading with opacity.
const STYLES: Record<Variant, string> = {
  primary:
    'border border-primary bg-primary text-surface hover:border-primary-hover hover:bg-primary-hover active:bg-primary-hover disabled:border-border disabled:bg-surface-tint disabled:text-content-muted',
  secondary:
    'border border-surface-tint bg-surface-tint text-primary-hover hover:border-accent hover:bg-accent active:bg-accent disabled:text-content-muted',
  outline:
    'border border-content-muted bg-surface text-content hover:bg-surface-tint active:bg-accent disabled:border-border disabled:bg-surface-tint disabled:text-content-muted',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: string;
  children: ReactNode;
}

/** Severity red is never used here. Destructive actions use outline plus a confirm step. */
export function Button({ variant = 'primary', icon, children, className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold leading-none disabled:cursor-not-allowed ${STYLES[variant]} ${className}`}
    >
      {icon && <Icon name={icon} className="!text-xl" />}
      {children}
    </button>
  );
}
