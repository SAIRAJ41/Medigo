import { useCallback, useState } from 'react';

export type FormErrors<K extends string> = Partial<Record<K, string>>;

/**
 * Tiny form helper: values, touched flags and validation.
 * Errors for a field show after it is touched (blurred) or after a submit attempt.
 */
export function useFormState<K extends string>(initial: Record<K, string>, validate: (values: Record<K, string>) => FormErrors<K>) {
  const [values, setValues] = useState<Record<K, string>>(initial);
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(values);
  const visibleError = (k: K): string | undefined => (touched[k] || submitted ? errors[k] : undefined);
  const hasErrors = Object.values(errors).some(Boolean);

  const setValue = useCallback((k: K, v: string) => setValues((prev) => ({ ...prev, [k]: v })), []);
  const touch = useCallback((k: K) => setTouched((prev) => ({ ...prev, [k]: true })), []);

  /** Props for a TextField / PasswordField bound to key k. */
  const bind = (k: K) => ({
    value: values[k],
    onChange: (v: string) => setValue(k, v),
    onBlur: () => touch(k),
    error: visibleError(k),
  });

  const reset = useCallback(
    (next?: Record<K, string>) => {
      setValues(next ?? initial);
      setTouched({});
      setSubmitted(false);
    },
    // `initial` is read only when no explicit values are passed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { values, errors, hasErrors, submitted, setSubmitted, setValue, bind, reset };
}
