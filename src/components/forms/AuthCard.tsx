import type { ReactNode } from 'react';
import { Icon } from '../common/Icon';

/** Link-style button used for switching between Sign in and Sign up. */
export const LINK_BUTTON = 'rounded font-semibold text-primary-hover underline underline-offset-2 hover:text-content';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Centered 440 px white card on the page background, used by Login and Sign Up. */
export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-border bg-surface">
        {/* Solid primary band: brand and purpose. White on primary passes AA. */}
        <div className="bg-primary px-8 py-6 text-surface">
          <div className="flex items-center gap-2 text-xl font-bold leading-none">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-primary-hover">
              <Icon name="add_circle" className="!text-xl" />
            </span>
            MediGo
          </div>
          <p className="mt-3 text-sm leading-5">Step-by-step first-aid guidance.</p>
        </div>
        <div className="p-8">
          <h1 className="text-2xl font-bold leading-8 text-content">{title}</h1>
          {subtitle && <p className="mt-1 text-sm leading-5 text-content-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-6 text-center text-sm leading-5 text-content">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
