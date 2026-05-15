import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type ApiUser, type AuthSuccess } from "./api";
import { tokenStore } from "./auth-store";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  signup: (input: SignupInput) => Promise<{ message: string }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

interface SignupInput {
  email: string;
  password: string;
  name: string;
  university?: string;
  major?: string;
  gradYear?: number;
  role: "HIRE" | "WORK" | "BOTH";
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if we have a stored token, hydrate the user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<ApiUser>("/auth/me");
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) {
          tokenStore.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshMe = async () => {
    const res = await api.get<ApiUser>("/auth/me");
    setUser(res.data);
  };

  const signup = async (input: SignupInput) => {
    const res = await api.post<{ user: ApiUser; message: string }>("/auth/signup", input);
    return { message: res.data.message };
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthSuccess>("/auth/login", { email, password });
    tokenStore.set(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    const refreshToken = tokenStore.getRefresh();
    tokenStore.clear();
    setUser(null);
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        /* best-effort */
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
