import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Icon } from '../components/common/Icon';
import { showToast } from '../components/common/Toast';
import { FormError } from '../components/forms/FormError';
import { PasswordField } from '../components/forms/PasswordField';
import { PasswordStrength } from '../components/forms/PasswordStrength';
import { TextField } from '../components/forms/TextField';
import { useFormState, type FormErrors } from '../components/forms/useFormState';
import { useAuth } from '../context/AuthContext';
import { AuthError, MIN_PASSWORD_LENGTH } from '../services/AuthService';
import type { User } from '../types/User';
import { formatDate, initials } from '../utils/format';

const CARD = 'rounded-xl border border-border bg-surface p-6';
const CARD_TITLE = 'flex items-center gap-2 text-lg font-bold leading-7 text-content';

/** Optional phone: 7 to 15 digits, with spaces, +, - or brackets allowed. */
const isValidPhone = (v: string) => /^[+\d\s()-]+$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 7 && (v.match(/\d/g)?.length ?? 0) <= 15;

export function ProfileScreen() {
  const { user } = useAuth();
  if (!user) return null; // AppShell only renders this when signed in
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-8 md:px-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold leading-8 text-content">Profile</h1>
        <p className="mt-1 text-sm leading-5 text-content-muted">Your details are stored on this device only.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SummaryCard user={user} />
        <DetailsCard user={user} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChangePasswordCard />
        <AccountCard />
      </div>
    </div>
  );
}

/* ---------- Left: avatar, name, email ---------- */

function SummaryCard({ user }: { user: User }) {
  return (
    <section className={`${CARD} flex flex-col items-center text-center`} aria-label="Account summary">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-surface-tint text-2xl font-bold leading-none text-primary"
        aria-hidden="true"
      >
        {initials(user.fullName)}
      </div>
      <h2 className="mt-4 text-lg font-bold leading-7 text-content">{user.fullName}</h2>
      <p className="mt-1 break-all text-sm leading-5 text-content-muted">{user.email}</p>
      <p className="mt-4 inline-flex h-8 items-center gap-2 rounded-full bg-surface-tint px-3 text-xs font-semibold leading-none text-content">
        <Icon name="calendar_today" className="!text-base" />
        Member since {formatDate(user.createdAt)}
      </p>
      {user.emergencyContactName && (
        <div className="mt-6 w-full border-t border-border pt-4 text-left">
          <p className="text-xs font-semibold leading-5 text-content-muted">Emergency contact</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold leading-5 text-content">
            <Icon name="contact_emergency" className="!text-xl text-primary-hover" />
            {user.emergencyContactName}
          </p>
          {user.emergencyContactPhone && (
            <a href={`tel:${user.emergencyContactPhone}`} className="mt-1 inline-block rounded pl-7 text-sm leading-5 text-primary-hover underline hover:text-content">
              {user.emergencyContactPhone}
            </a>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- Right: editable details ---------- */

type DetailField = 'fullName' | 'phone' | 'emergencyContactName' | 'emergencyContactPhone';
const DETAIL_IDS: Record<DetailField, string> = {
  fullName: 'profile-name',
  phone: 'profile-phone',
  emergencyContactName: 'profile-ec-name',
  emergencyContactPhone: 'profile-ec-phone',
};
const DETAIL_ORDER: DetailField[] = ['fullName', 'phone', 'emergencyContactName', 'emergencyContactPhone'];

const detailsFrom = (u: User): Record<DetailField, string> => ({
  fullName: u.fullName,
  phone: u.phone ?? '',
  emergencyContactName: u.emergencyContactName ?? '',
  emergencyContactPhone: u.emergencyContactPhone ?? '',
});

const validateDetails = (v: Record<DetailField, string>): FormErrors<DetailField> => {
  const e: FormErrors<DetailField> = {};
  if (!v.fullName.trim()) e.fullName = 'Enter your full name.';
  if (v.phone.trim() && !isValidPhone(v.phone.trim())) e.phone = 'Enter a phone number with 7 to 15 digits.';
  if (v.emergencyContactPhone.trim() && !isValidPhone(v.emergencyContactPhone.trim())) {
    e.emergencyContactPhone = 'Enter a phone number with 7 to 15 digits.';
  }
  return e;
};

function DetailsCard({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const form = useFormState<DetailField>(detailsFrom(user), validateDetails);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { reset } = form;

  // Keep the form in step with the saved user (after Save, or another tab's change on reload).
  useEffect(() => reset(detailsFrom(user)), [user, reset]);

  const saved = detailsFrom(user);
  const dirty = DETAIL_ORDER.some((k) => form.values[k].trim() !== saved[k].trim());

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    form.setSubmitted(true);
    setFormError(null);
    if (form.focusFirstInvalid(DETAIL_IDS, DETAIL_ORDER)) return;
    setSaving(true);
    try {
      await updateProfile({ ...form.values });
      showToast('Profile saved');
    } catch {
      setFormError('Could not save your details on this device. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`${CARD} lg:col-span-2`} aria-labelledby="profile-details-title">
      <h2 id="profile-details-title" className={CARD_TITLE}>
        <Icon name="badge" className="!text-xl text-primary-hover" />
        Personal details
      </h2>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id={DETAIL_IDS.fullName} label="Full name" autoComplete="name" required disabled={saving} {...form.bind('fullName')} />
          <TextField
            id="profile-email"
            label="Email"
            type="email"
            value={user.email}
            onChange={() => undefined}
            readOnly
            hint="Email can't be changed for accounts on this device."
            trailing={<Icon name="lock" className="!text-xl mr-3 text-content-muted" />}
          />
          <TextField id={DETAIL_IDS.phone} label="Phone" type="tel" autoComplete="tel" inputMode="tel" disabled={saving} {...form.bind('phone')} />
          <div className="hidden sm:block" aria-hidden="true" />
          <TextField
            id={DETAIL_IDS.emergencyContactName}
            label="Emergency contact name"
            autoComplete="section-emergency name"
            disabled={saving}
            {...form.bind('emergencyContactName')}
          />
          <TextField
            id={DETAIL_IDS.emergencyContactPhone}
            label="Emergency contact phone"
            type="tel"
            autoComplete="section-emergency tel"
            inputMode="tel"
            disabled={saving}
            {...form.bind('emergencyContactPhone')}
          />
        </div>
        <FormError message={formError} />
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving || !dirty}
            onClick={() => {
              setFormError(null);
              reset(detailsFrom(user));
            }}
          >
            Cancel
          </Button>
          <Button type="submit" icon="save" disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Change password ---------- */

type PwField = 'current' | 'next' | 'confirm';
const PW_IDS: Record<PwField, string> = { current: 'pw-current', next: 'pw-new', confirm: 'pw-confirm' };
const PW_ORDER: PwField[] = ['current', 'next', 'confirm'];
const PW_STRENGTH_ID = 'pw-new-strength';
const EMPTY_PW: Record<PwField, string> = { current: '', next: '', confirm: '' };

function ChangePasswordCard() {
  const { changePassword } = useAuth();
  const [wrongCurrent, setWrongCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (form.focusFirstInvalid(PW_IDS, PW_ORDER)) return;
    setSaving(true);
    try {
      await changePassword(form.values.current, form.values.next);
      form.reset(EMPTY_PW);
      setWrongCurrent(null);
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
        <div className="flex justify-end border-t border-border pt-4">
          <Button type="submit" icon="key" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Sign out / delete ---------- */

function AccountCard() {
  const { signOut, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const doSignOut = async () => {
    await signOut();
    showToast('Signed out');
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      showToast('Account deleted');
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <section className={`${CARD} flex flex-col`} aria-labelledby="account-title">
      <h2 id="account-title" className={CARD_TITLE}>
        <Icon name="manage_accounts" className="!text-xl text-primary-hover" />
        Account
      </h2>
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-tint p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-content">Sign out</p>
            <p className="mt-1 text-xs leading-5 text-content-muted">Your account and saved checks stay on this device.</p>
          </div>
          <Button variant="outline" icon="logout" onClick={doSignOut}>
            Sign out
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-content-muted p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-content">Delete account</p>
            <p className="mt-1 text-xs leading-5 text-content-muted">Removes your profile and password from this device. This cannot be undone.</p>
          </div>
          <Button variant="outline" icon="delete" onClick={() => setConfirming(true)}>
            Delete account
          </Button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Delete your account?"
          message={
            <>
              This removes your profile, emergency contact and password from this device. Local accounts cannot be recovered.
            </>
          }
          confirmLabel="Yes, delete account"
          busy={busy}
          onConfirm={doDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  );
}
