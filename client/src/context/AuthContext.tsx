import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";

interface AuthContextValue {
  accessToken: string | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .refresh()
      .then((data) => setAccessToken(data.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function signup(email: string, password: string) {
    const data = await authApi.signup(email, password);
    setAccessToken(data.accessToken);
  }

  async function login(email: string, password: string) {
    const data = await authApi.login(email, password);
    setAccessToken(data.accessToken);
  }

  async function logout() {
    await authApi.logout();
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}