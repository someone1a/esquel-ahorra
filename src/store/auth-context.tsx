import {
  clearAuthStorage,
  getAuthSnapshot,
  getRefreshToken,
  setTokens,
  setUser as setStoredUser,
  subscribeAuth,
} from "@/auth/session";
import { authService } from "@/services/auth";
import { Token, User } from "@/types/auth";
import { router } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (tokenData: Token) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken().catch(() => null);
    try {
      await authService.logout(refreshToken ?? undefined);
    } catch {}

    await clearAuthStorage();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, []);

  const loadStoredAuth = useCallback(async () => {
    try {
      const snap = await getAuthSnapshot();

      setToken(snap.tokens?.accessToken ?? null);
      setUser(snap.user);

      if (!snap.tokens) return;

      const userData = await authService.getMe();
      setUser(userData);
      await setStoredUser(userData);
    } catch (error) {
      if ((error as any)?.status === 401 || (error as any)?.message === "Unauthorized") {
        await logout();
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  useEffect(() => {
    const unsubscribe = subscribeAuth((snap) => {
      setToken(snap.tokens?.accessToken ?? null);
      setUser(snap.user);
    });
    return unsubscribe;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      await setStoredUser(userData);
    } catch (error) {
      if ((error as any)?.status === 401 || (error as any)?.message === "Unauthorized") {
        await logout();
      }
    }
  }, [logout]);

  const login = useCallback(async (tokenData: Token) => {
    await setTokens(tokenData);
    setToken(tokenData.access_token);

    try {
      const userData = await authService.getMe();
      setUser(userData);
      await setStoredUser(userData);
    } catch {
      await setStoredUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout, refreshUser }),
    [user, token, isLoading, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
