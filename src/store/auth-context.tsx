import { authService } from "@/services/auth";
import { Token, User } from "@/types/auth";
import { storage } from "@/utils/storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (tokenData: Token) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}

    setToken(null);
    setUser(null);

    if (Platform.OS === "web") {
      await storage.clear();
      window.location.replace("/welcome");
    } else {
      await storage.removeItem(TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);
      await storage.removeItem(USER_KEY);
    }
  }, []);

  const loadStoredAuth = useCallback(async () => {
    try {
      const storedToken = await storage.getItem(TOKEN_KEY);
      const storedUser = await storage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Validar el token con el backend al iniciar
        try {
          const userData = await authService.getMe();
          setUser(userData);
          await storage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error: any) {
          console.error("Token invalid or expired on boot:", error);
          // Si el error es 401, limpiar la sesión
          if (error.message === "Unauthorized" || error.status === 401) {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      await storage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const login = async (tokenData: Token) => {
    setToken(tokenData.access_token);
    
    await storage.setItem(TOKEN_KEY, tokenData.access_token);
    await storage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token);
    
    // Fetch user profile after login
    try {
      const userData = await authService.getMe();
      setUser(userData);
      await storage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user profile after login:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
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
