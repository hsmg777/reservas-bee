import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth";
import type { UserDTO, UserRole, LoginRequest } from "../types/auth";

type AuthState = {
  user: UserDTO | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (payload: LoginRequest) => Promise<UserDTO>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [loading, setLoading] = useState(true);

  // Al iniciar app: si hay token => /me
  useEffect(() => {
    const init = async () => {
      const t = authService.getToken();
      if (!t) {
        setLoading(false);
        return;
      }

      try {
        setToken(t);
        const me = await authService.me();
        setUser(me.user);
      } catch {
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (payload: LoginRequest) => {
    const res = await authService.login(payload);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, hasRole }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}

// helper: a dónde mandarlo según rol
export function getDashboardPathByRole(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "seguridad") return "/seguridad";
  return "/";
}
