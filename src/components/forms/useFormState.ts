import { useCallback, useEffect, useState } from 'react';

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

  // Focus is moved after React has re-rendered, so a field that was disabled while submitting can take it.
  const [focusRequest, setFocusRequest] = useState<{ id: string } | null>(null);
  useEffect(() => {
    if (focusRequest) document.getElementById(focusRequest.id)?.focus();
  }, [focusRequest]);

  /** Moves focus to the input with this id once the current update has rendered. */
  const focusField = useCallback((id: string) => setFocusRequest({ id }), []);

  /** Focuses the first field (in `order`) that has an error. Returns false when there is none. */
  const focusFirstInvalid = (ids: Record<K, string>, order: K[]): boolean => {
    const first = order.find((k) => errors[k]);
    if (first) focusField(ids[first]);
    return first !== undefined;
  };

  return { values, errors, hasErrors, submitted, setSubmitted, setValue, bind, reset, focusField, focusFirstInvalid };
}
