import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline';

const STYLES: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
  secondary: 'bg-surface-tint text-primary hover:bg-accent',
  outline: 'bg-surface text-content border border-border hover:bg-surface-tint',
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${STYLES[variant]} ${className}`}
    >
      {icon && <Icon name={icon} className="!text-xl" />}
      {children}
    </button>
  );
}
