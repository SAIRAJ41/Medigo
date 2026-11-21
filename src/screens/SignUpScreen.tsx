import { useState, type FormEvent } from 'react';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { showToast } from '../components/common/Toast';
import { AuthCard, LINK_BUTTON } from '../components/forms/AuthCard';
import { FormError } from '../components/forms/FormError';
import { PasswordField } from '../components/forms/PasswordField';
import { PasswordStrength } from '../components/forms/PasswordStrength';
import { TextField } from '../components/forms/TextField';
import { useFormState, type FormErrors } from '../components/forms/useFormState';
import { useAuth } from '../context/AuthContext';
import { AuthError, isValidEmail, MIN_PASSWORD_LENGTH, normalizeEmail } from '../services/AuthService';

type Field = 'fullName' | 'email' | 'password' | 'confirm';
const IDS: Record<Field, string> = {
  fullName: 'signup-name',
  email: 'signup-email',
  password: 'signup-password',
  confirm: 'signup-confirm',
};
const ORDER: Field[] = ['fullName', 'email', 'password', 'confirm'];
const STRENGTH_ID = 'signup-password-strength';

export function SignUpScreen({ onSignIn }: { onSignIn: () => void }) {
  const { signUp } = useAuth();
  const [takenEmail, setTakenEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (v: Record<Field, string>): FormErrors<Field> => {
    const e: FormErrors<Field> = {};
    if (!v.fullName.trim()) e.fullName = 'Enter your full name.';
    if (!v.email.trim()) e.email = 'Enter your email address.';
    else if (!isValidEmail(v.email)) e.email = 'Enter an email address like name@example.com.';
    else if (takenEmail && normalizeEmail(v.email) === takenEmail) e.email = 'An account with this email already exists on this device. Sign in instead.';
    if (v.password.length < MIN_PASSWORD_LENGTH) e.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!v.confirm) e.confirm = 'Enter your password again.';
    else if (v.confirm !== v.password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const form = useFormState<Field>({ fullName: '', email: '', password: '', confirm: '' }, validate);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    form.setSubmitted(true);
    setFormError(null);
    if (form.focusFirstInvalid(IDS, ORDER)) return;
    setSubmitting(true);
    try {
      await signUp({ fullName: form.values.fullName, email: form.values.email, password: form.values.password });
      showToast('Account created');
      // Signed in now: AppShell shows the Dashboard.
    } catch (err) {
      setSubmitting(false);
      if (err instanceof AuthError && err.code === 'EMAIL_TAKEN') {
        setTakenEmail(normalizeEmail(form.values.email)); // shows under the email field
        form.focusField(IDS.email);
      } else {
        setFormError('Could not create the account on this device. Please try again.');
      }
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Save your checks and emergency contact on this device."
      footer={
        <>
          Already have an account?{' '}
          <button type="button" onClick={onSignIn} className={LINK_BUTTON}>
            Sign in
          </button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id={IDS.fullName} label="Full name" autoComplete="name" required disabled={submitting} {...form.bind('fullName')} />
        <TextField id={IDS.email} label="Email" type="email" autoComplete="email" inputMode="email" required disabled={submitting} {...form.bind('email')} />
        <div>
          <PasswordField
            id={IDS.password}
            label="Password"
            autoComplete="new-password"
            required
            disabled={submitting}
            describedBy={STRENGTH_ID}
            {...form.bind('password')}
          />
          <PasswordStrength id={STRENGTH_ID} password={form.values.password} />
        </div>
        <PasswordField id={IDS.confirm} label="Confirm password" autoComplete="new-password" required disabled={submitting} {...form.bind('confirm')} />
        <FormError message={formError} />
        <Button type="submit" icon="person_add" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="flex items-center justify-center gap-2 text-xs leading-5 text-content-muted">
          <Icon name="smartphone" className="!text-xl" />
          Accounts are stored on this device only.
        </p>
      </form>
    </AuthCard>
  );
}
