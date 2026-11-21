import { useState } from 'react';
import { Icon } from '../common/Icon';
import { TextField, type TextFieldProps } from './TextField';

type Props = Omit<TextFieldProps, 'type' | 'trailing' | 'inputMode'> & {
  autoComplete: 'current-password' | 'new-password';
};

/** Password input with a show/hide toggle. The toggle never submits the form. */
export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${props.label.toLowerCase()}` : `Show ${props.label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={props.id}
          disabled={props.disabled}
          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-content hover:bg-surface-tint active:bg-accent disabled:cursor-not-allowed"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="!text-xl" />
        </button>
      }
    />
  );
}
