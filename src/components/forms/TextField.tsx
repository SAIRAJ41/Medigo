import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../common/Icon';

export interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  /** Helper text under the field, linked with aria-describedby. */
  hint?: ReactNode;
  /** Shown with an icon, and the field gets a heavier outline (never colour alone). */
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  /** Optional element inside the field on the right, such as a show/hide button. */
  trailing?: ReactNode;
  /** Extra ids for aria-describedby, such as a password strength hint. */
  describedBy?: string;
}

/** Labelled input with hint and inline error, matching the app's control styles. */
export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  inputMode,
  hint,
  error,
  required,
  readOnly,
  disabled,
  trailing,
  describedBy,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedIds = [errorId, hintId, describedBy].filter(Boolean).join(' ') || undefined;

  // Error: text-colour border plus a 1 px ring (heavier outline) and an icon message below.
  const frame = error
    ? 'border-content bg-surface ring-1 ring-content'
    : readOnly
      ? 'border-border bg-surface-tint'
      : 'border-content-muted bg-surface';

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold leading-5 text-content">
        {label}
        {!required && !readOnly && <span className="text-xs font-normal text-content-muted">(optional)</span>}
      </label>
      <div
        className={`mt-2 flex items-center rounded-lg border has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-primary-hover ${frame}`}
      >
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedIds}
          className="h-10 min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed read-only:cursor-default"
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-2 text-sm font-medium leading-5 text-content">
          <Icon name="error" className="!text-xl" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-2 text-xs leading-5 text-content-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
