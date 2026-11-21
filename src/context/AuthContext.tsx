import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LocalSessionStore } from '../data/SessionStore';
import { LocalUserRepository } from '../data/UserRepository';
import { AuthService, type IAuthService, type ProfileChanges, type SignUpInput } from '../services/AuthService';
import type { User } from '../types/User';

export interface AuthContextValue {
  user: User | null;
  /** True until the saved session has been checked on start-up. */
  loading: boolean;
  signUp(input: SignUpInput): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  updateProfile(changes: ProfileChanges): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  deleteAccount(): Promise<void>;
  signInLockedUntil(): number | null;
}

/** The only place that picks the auth implementation. Swap for a server-backed IAuthService later. */
const auth: IAuthService = new AuthService(new LocalUserRepository(), new LocalSessionStore());

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the signed-in session after a reload.
  useEffect(() => {
    let active = true;
    auth
      .currentUser()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const u = await auth.signUp(input);
    setUser(u);
    return u;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await auth.signIn(email, password);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (changes: ProfileChanges) => {
    const u = await auth.updateProfile(changes);
    setUser(u);
    return u;
  }, []);

  const changePassword = useCallback((current: string, next: string) => auth.changePassword(current, next), []);

  const deleteAccount = useCallback(async () => {
    await auth.deleteAccount();
    setUser(null);
  }, []);

  const signInLockedUntil = useCallback(() => auth.signInLockedUntil(), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signUp, signIn, signOut, updateProfile, changePassword, deleteAccount, signInLockedUntil }),
    [user, loading, signUp, signIn, signOut, updateProfile, changePassword, deleteAccount, signInLockedUntil],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}
