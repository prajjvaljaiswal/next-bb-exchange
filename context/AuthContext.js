"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiPost, apiGet } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, email, role, isEmailVerified, bloodBankId }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshInFlight = useRef(false);

  // Silent refresh on mount
  useEffect(() => {
    silentRefresh();
  }, []);

  const silentRefresh = useCallback(async () => {
    // Guard against concurrent calls (React StrictMode runs effects twice in dev)
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    try {
      const data = await apiPost("/auth/refresh", {}, { skipAuth: true });
      setAccessToken(data.accessToken);
      // Fetch user profile
      const me = await apiGet("/auth/me", { token: data.accessToken });
      setUser(me);
      // Store role in cookie for middleware
      document.cookie = `userRole=${me.role}; path=/; SameSite=Strict`;
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
      refreshInFlight.current = false;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiPost("/auth/login", { email, password }, { skipAuth: true });
    setAccessToken(data.accessToken);
    // Fetch user profile
    const me = await apiGet("/auth/me", { token: data.accessToken });
    setUser(me);
    document.cookie = `userRole=${me.role}; path=/; SameSite=Strict`;
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {}, { token: accessToken });
    } catch {}
    setUser(null);
    setAccessToken(null);
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, silentRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
