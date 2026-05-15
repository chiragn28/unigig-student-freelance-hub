// Minimal browser-only token store. SSR-safe (no-op on the server).

const ACCESS_KEY = "unigig.accessToken";
const REFRESH_KEY = "unigig.refreshToken";

const isBrowser = (): boolean => typeof window !== "undefined" && typeof localStorage !== "undefined";

export const tokenStore = {
  getAccess(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
