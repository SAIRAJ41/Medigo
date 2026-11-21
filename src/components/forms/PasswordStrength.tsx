import { MIN_PASSWORD_LENGTH } from '../../services/AuthService';
import { Icon } from '../common/Icon';

interface Strength {
  level: 0 | 1 | 2 | 3; // 0 too short, 1 weak, 2 fair, 3 strong
  icon: string;
  text: string;
}

/** Simple local estimate from length and character variety. A hint only, not a rule. */
export function passwordStrength(pw: string): Strength {
  if (pw.length < MIN_PASSWORD_LENGTH) {
    const left = MIN_PASSWORD_LENGTH - pw.length;
    return {
      level: 0,
      icon: 'gpp_bad',
      text: pw.length === 0 ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : `Too short: ${left} more character${left === 1 ? '' : 's'} needed.`,
    };
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if ((variety >= 3 && pw.length >= 12) || (variety === 4 && pw.length >= 10)) {
    return { level: 3, icon: 'gpp_good', text: 'Strong password.' };
  }
  if (variety >= 2 || pw.length >= 12) {
    return { level: 2, icon: 'shield', text: 'Fair. Add length, numbers or symbols to make it stronger.' };
  }
  return { level: 1, icon: 'gpp_maybe', text: 'Weak. Mix letters, numbers and symbols.' };
}

/** Live strength hint: icon + text carry the meaning; the bar is decorative. */
export function PasswordStrength({ id, password }: { id: string; password: string }) {
  const s = passwordStrength(password);
  return (
    <div id={id} className="mt-2" aria-live="polite">
      <div className="mb-2 grid grid-cols-3 gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1 rounded-full ${s.level >= n ? 'bg-primary-hover' : 'bg-border'}`} />
        ))}
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-content">
        <Icon name={s.icon} className="!text-xl" />
        <span>{s.text}</span>
      </p>
    </div>
  );
}
