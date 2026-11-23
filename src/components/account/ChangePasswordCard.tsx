import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthError, MIN_PASSWORD_LENGTH } from '../../services/AuthService';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { showToast } from '../common/Toast';
import { FormError } from '../forms/FormError';
import { PasswordField } from '../forms/PasswordField';
import { PasswordStrength } from '../forms/PasswordStrength';
import { useFormState, type FormErrors } from '../forms/useFormState';

const CARD = 'rounded-xl border border-border bg-surface p-6';
const CARD_TITLE = 'flex items-center gap-2 text-lg font-bold leading-7 text-content';

type PwField = 'current' | 'next' | 'confirm';
const PW_IDS: Record<PwField, string> = { current: 'pw-current', next: 'pw-new', confirm: 'pw-confirm' };
const PW_ORDER: PwField[] = ['current', 'next', 'confirm'];
const PW_STRENGTH_ID = 'pw-new-strength';
const EMPTY_PW: Record<PwField, string> = { current: '', next: '', confirm: '' };

/** Changes the local account password (AuthService.changePassword). Inline errors, inline success message. */
export function ChangePasswordCard() {
  const { changePassword } = useAuth();
  const [wrongCurrent, setWrongCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (v: Record<PwField, string>): FormErrors<PwField> => {
    const e: FormErrors<PwField> = {};
    if (!v.current) e.current = 'Enter your current password.';
    else if (wrongCurrent !== null && v.current === wrongCurrent) e.current = 'Current password is incorrect.';
    if (v.next.length < MIN_PASSWORD_LENGTH) e.next = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    else if (v.next === v.current) e.next = 'Choose a password different from your current one.';
    if (!v.confirm) e.confirm = 'Enter the new password again.';
    else if (v.confirm !== v.next) e.confirm = 'Passwords do not match.';
    return e;
  };

  const form = useFormState<PwField>(EMPTY_PW, validate);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    form.setSubmitted(true);
    setFormError(null);
    setSuccess(false);
    if (form.focusFirstInvalid(PW_IDS, PW_ORDER)) return;
    setSaving(true);
    try {
      await changePassword(form.values.current, form.values.next);
      form.reset(EMPTY_PW);
      setWrongCurrent(null);
      setSuccess(true);
      showToast('Password changed');
    } catch (err) {
      if (err instanceof AuthError && err.code === 'WRONG_PASSWORD') {
        setWrongCurrent(form.values.current); // shows under the current password field
        form.focusField(PW_IDS.current);
      } else {
        setFormError('Could not change the password on this device. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={CARD} aria-labelledby="change-password-title">
      <h2 id="change-password-title" className={CARD_TITLE}>
        <Icon name="key" className="!text-xl text-primary-hover" />
        Change password
      </h2>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <PasswordField id={PW_IDS.current} label="Current password" autoComplete="current-password" required disabled={saving} {...form.bind('current')} />
        <div>
          <PasswordField
            id={PW_IDS.next}
            label="New password"
            autoComplete="new-password"
            required
            disabled={saving}
            describedBy={PW_STRENGTH_ID}
            {...form.bind('next')}
          />
          <PasswordStrength id={PW_STRENGTH_ID} password={form.values.next} />
        </div>
        <PasswordField id={PW_IDS.confirm} label="Confirm new password" autoComplete="new-password" required disabled={saving} {...form.bind('confirm')} />
        <FormError message={formError} />
        {success && (
          <p role="status" className="flex items-start gap-2 rounded-lg bg-surface-tint p-3 text-sm font-medium leading-5 text-content">
            <Icon name="task_alt" className="!text-xl text-primary-hover" />
            Password changed. Use the new password next time you sign in on this device.
          </p>
        )}
        <div className="flex justify-end border-t border-border pt-4">
          <Button type="submit" icon="key" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </section>
  );
}

