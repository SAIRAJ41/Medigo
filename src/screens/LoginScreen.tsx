import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { AuthCard, LINK_BUTTON } from '../components/forms/AuthCard';
import { FormError } from '../components/forms/FormError';
import { PasswordField } from '../components/forms/PasswordField';
import { TextField } from '../components/forms/TextField';
import { useFormState, type FormErrors } from '../components/forms/useFormState';
import { useAuth } from '../context/AuthContext';
import { AuthError, isValidEmail } from '../services/AuthService';

type Field = 'email' | 'password';
const IDS: Record<Field, string> = { email: 'login-email', password: 'login-password' };
const ORDER: Field[] = ['email', 'password'];

const validate = (v: Record<Field, string>): FormErrors<Field> => {
  const e: FormErrors<Field> = {};
  if (!v.email.trim()) e.email = 'Enter your email address.';
  else if (!isValidEmail(v.email)) e.email = 'Enter an email address like name@example.com.';
  if (!v.password) e.password = 'Enter your password.';
  return e;
};

export function LoginScreen({ onCreateAccount }: { onCreateAccount: () => void }) {
  const { signIn, signInLockedUntil } = useAuth();
  const form = useFormState<Field>({ email: '', password: '' }, validate);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Wrong email/password: shown under the password field, cleared when the user types again.
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => signInLockedUntil());
  const [now, setNow] = useState(() => Date.now());

  // Countdown while sign-in is locked after too many wrong attempts.
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) {
        setLockedUntil(null);
        setFormError(null);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const locked = secondsLeft > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || locked) return;
    form.setSubmitted(true);
    setFormError(null);
    setCredentialError(null);
    if (form.focusFirstInvalid(IDS, ORDER)) return;
    setSubmitting(true);
    try {
      await signIn(form.values.email, form.values.password);
      // AppShell switches to the Dashboard as soon as the user is set.
    } catch (err) {
      if (err instanceof AuthError && err.code === 'LOCKED' && err.retryAt) {
        setNow(Date.now());
        setLockedUntil(err.retryAt);
        setFormError('Too many wrong attempts. Sign-in is paused for 30 seconds.');
      } else if (err instanceof AuthError && err.code === 'INVALID_CREDENTIALS') {
        const left = err.attemptsLeft ?? 0;
        setCredentialError(`${err.message} ${left} attempt${left === 1 ? '' : 's'} left before a 30-second pause.`);
      } else {
        setFormError('Sign-in failed on this device. Please try again.');
      }
      form.setValue('password', '');
      form.setSubmitted(false); // the message explains it; don't also flag the cleared field as empty
      setSubmitting(false);
      form.focusField(IDS.password);
    }
  };

  const password = form.bind('password');

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Sign in to see your saved checks."
      footer={
        <>
          New to MediGo?{' '}
          <button type="button" onClick={onCreateAccount} className={LINK_BUTTON}>
            Create an account
          </button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id={IDS.email} label="Email" type="email" autoComplete="email" inputMode="email" required disabled={submitting} {...form.bind('email')} />
        <PasswordField
          id={IDS.password}
          label="Password"
          autoComplete="current-password"
          required
          disabled={submitting}
          {...password}
          onChange={(v) => {
            setCredentialError(null);
            password.onChange(v);
          }}
          error={password.error ?? credentialError ?? undefined}
        />
        <FormError message={formError} />
        <Button type="submit" icon={locked ? 'timer' : 'login'} disabled={submitting || locked} className="w-full" aria-describedby="login-device-note">
          {locked ? `Try again in ${secondsLeft} s` : submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p id="login-device-note" className="flex items-center justify-center gap-2 text-xs leading-5 text-content-muted">
          <Icon name="smartphone" className="!text-xl" />
          Accounts are stored on this device only.
        </p>
      </form>
    </AuthCard>
  );
}
