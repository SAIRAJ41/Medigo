/** Remembers who is signed in. Holds only the userId, never a password or hash. */
export interface ISessionStore {
  getUserId(): number | null;
  setUserId(id: number): void;
  clear(): void;
}

const SESSION_KEY = 'medigo.session';

/** localStorage keeps the session across reloads. Replaced by a server token later. */
export class LocalSessionStore implements ISessionStore {
  getUserId(): number | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      const id = raw ? Number(raw) : NaN;
      return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }

  setUserId(id: number) {
    localStorage.setItem(SESSION_KEY, String(id));
  }

  clear() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // storage unavailable: nothing to clear
    }
  }
}
