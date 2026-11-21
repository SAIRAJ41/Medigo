/**
 * Local, on-device accounts.
 *
 * IMPORTANT: this is on-device convenience, NOT real security. Anyone with access to this
 * browser profile can read or wipe localStorage, and the sign-in rate limit only lives in memory.
 * Server-side authentication (accounts, sessions, lockouts) replaces this later behind IAuthService.
 */
import type { ISessionStore } from '../data/SessionStore';
import type { IUserRepository, StoredUser } from '../data/UserRepository';
import type { User } from '../types/User';

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'LOCKED'
  | 'WRONG_PASSWORD'
  | 'NOT_SIGNED_IN';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  /** For LOCKED: epoch ms when sign-in is allowed again. */
  readonly retryAt?: number;
  /** For INVALID_CREDENTIALS: wrong attempts left before the lock. */
  readonly attemptsLeft?: number;

  constructor(code: AuthErrorCode, message: string, extra: { retryAt?: number; attemptsLeft?: number } = {}) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.retryAt = extra.retryAt;
    this.attemptsLeft = extra.attemptsLeft;
  }
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export type ProfileChanges = Partial<Pick<User, 'fullName' | 'phone' | 'emergencyContactName' | 'emergencyContactPhone'>>;

/** Screens (through AuthContext) depend on this interface only. */
export interface IAuthService {
  signUp(input: SignUpInput): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
  updateProfile(changes: ProfileChanges): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  deleteAccount(): Promise<void>;
  /** Epoch ms until which sign-in is locked, or null. */
  signInLockedUntil(): number | null;
}

export const MIN_PASSWORD_LENGTH = 8;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;
const ITERATIONS = 210_000; // OWASP guidance for PBKDF2-HMAC-SHA512
const SALT_BYTES = 16;
const HASH_BITS = 256;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isValidEmail = (email: string) => EMAIL_RE.test(normalizeEmail(email));

// ---------- crypto helpers (Web Crypto only, no libraries) ----------

const toBase64 = (bytes: Uint8Array) => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveHash(password: string, salt: BufferSource, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-512' }, key, HASH_BITS);
  return new Uint8Array(bits);
}

/** Compares every byte so the time taken does not reveal where a mismatch is. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function hashNewPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveHash(password, salt, ITERATIONS);
  return { passwordSalt: toBase64(salt), passwordHash: toBase64(hash), passwordIterations: ITERATIONS };
}

async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  const hash = await deriveHash(password, fromBase64(user.passwordSalt), user.passwordIterations || ITERATIONS);
  return constantTimeEqual(hash, fromBase64(user.passwordHash));
}

/** Removes the password material before a user leaves the service. */
function toPublic(u: StoredUser): User {
  const { passwordSalt: _s, passwordHash: _h, passwordIterations: _i, ...user } = u;
  void _s;
  void _h;
  void _i;
  return user;
}

const clean = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : undefined;
};

export class AuthService implements IAuthService {
  // In-memory sign-in throttle. Convenience only; a reload resets it (see the note at the top).
  private failedAttempts = 0;
  private lockedUntil = 0;

  constructor(
    private readonly users: IUserRepository,
    private readonly session: ISessionStore,
  ) {}

  async signUp(input: SignUpInput): Promise<User> {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);
    if (!fullName || !isValidEmail(email) || input.password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError('INVALID_INPUT', 'Please check the highlighted fields.');
    }
    if (await this.users.findByEmail(email)) {
      throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists on this device.');
    }
    const created = await this.users.create({
      fullName,
      email,
      createdAt: new Date().toISOString(),
      ...(await hashNewPassword(input.password)),
    });
    this.session.setUserId(created.userId);
    return toPublic(created);
  }

  async signIn(email: string, password: string): Promise<User> {
    const locked = this.signInLockedUntil();
    if (locked) throw new AuthError('LOCKED', 'Too many wrong attempts. Please wait before trying again.', { retryAt: locked });

    const user = await this.users.findByEmail(normalizeEmail(email));
    // Hash even for unknown emails so both paths take about the same time.
    let ok = false;
    if (user) ok = await verifyPassword(user, password);
    else await deriveHash(password, new Uint8Array(SALT_BYTES), ITERATIONS);

    if (!user || !ok) {
      this.failedAttempts += 1;
      if (this.failedAttempts >= MAX_ATTEMPTS) {
        this.failedAttempts = 0;
        this.lockedUntil = Date.now() + LOCK_MS;
        throw new AuthError('LOCKED', 'Too many wrong attempts. Please wait before trying again.', { retryAt: this.lockedUntil });
      }
      throw new AuthError('INVALID_CREDENTIALS', 'Email or password is incorrect.', {
        attemptsLeft: MAX_ATTEMPTS - this.failedAttempts,
      });
    }

    this.failedAttempts = 0;
    this.lockedUntil = 0;
    this.session.setUserId(user.userId);
    return toPublic(user);
  }

  async signOut(): Promise<void> {
    this.session.clear();
  }

  async currentUser(): Promise<User | null> {
    const id = this.session.getUserId();
    if (id === null) return null;
    const user = await this.users.getById(id);
    if (!user) {
      this.session.clear(); // stale session for a deleted account
      return null;
    }
    return toPublic(user);
  }

  async updateProfile(changes: ProfileChanges): Promise<User> {
    const id = this.requireSession();
    // Only keys that were passed are changed; an empty string clears an optional field.
    const next: ProfileChanges = {};
    if ('phone' in changes) next.phone = clean(changes.phone);
    if ('emergencyContactName' in changes) next.emergencyContactName = clean(changes.emergencyContactName);
    if ('emergencyContactPhone' in changes) next.emergencyContactPhone = clean(changes.emergencyContactPhone);
    if (changes.fullName !== undefined) {
      const fullName = changes.fullName.trim();
      if (!fullName) throw new AuthError('INVALID_INPUT', 'Full name is required.');
      next.fullName = fullName;
    }
    return toPublic(await this.users.update(id, next));
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const id = this.requireSession();
    const user = await this.users.getById(id);
    if (!user) throw new AuthError('NOT_SIGNED_IN', 'Please sign in again.');
    if (!(await verifyPassword(user, currentPassword))) {
      throw new AuthError('WRONG_PASSWORD', 'Current password is incorrect.');
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError('INVALID_INPUT', `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    await this.users.update(id, await hashNewPassword(newPassword));
  }

  async deleteAccount(): Promise<void> {
    const id = this.requireSession();
    await this.users.delete(id);
    this.session.clear();
  }

  signInLockedUntil(): number | null {
    return this.lockedUntil > Date.now() ? this.lockedUntil : null;
  }

  private requireSession(): number {
    const id = this.session.getUserId();
    if (id === null) throw new AuthError('NOT_SIGNED_IN', 'Please sign in again.');
    return id;
  }
}
